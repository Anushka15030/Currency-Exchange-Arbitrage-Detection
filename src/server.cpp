#include <arpa/inet.h>
#include <cmath>
#include <cstring>
#include <iostream>
#include <map>
#include <netinet/in.h>
#include <sstream>
#include <set>
#include <string>
#include <sys/socket.h>
#include <unistd.h>
#include <vector>
#include <algorithm>

struct Rate { std::string from, to; double rate; };
static const std::vector<Rate> rates = {
 {"USD","EUR",0.92},{"EUR","GBP",0.86},{"GBP","USD",1.27},
 {"USD","JPY",149.50},{"JPY","EUR",0.00615},{"EUR","USD",1.087},
 {"USD","CAD",1.36},{"CAD","CHF",0.65},{"CHF","USD",1.12},
 {"GBP","JPY",188.0},{"JPY","GBP",0.00530},{"CAD","EUR",0.68}
};
struct Cycle { std::vector<std::string> path; double gross, net; };
std::string jsonEscape(const std::string& s) { std::string o; for(char c:s){ if(c=='"'||c=='\\') o+='\\'; o+=c; } return o; }
std::string ratesJson(){ std::ostringstream o; o << "{\"rates\":["; for(size_t i=0;i<rates.size();++i){if(i)o<<",";o<<"{\"from\":\""<<rates[i].from<<"\",\"to\":\""<<rates[i].to<<"\",\"rate\":"<<rates[i].rate<<"}";} o<<"]}";return o.str(); }
std::string analyze(double amount,double fee){
 std::vector<std::string> currencies; for(auto&r:rates){currencies.push_back(r.from);currencies.push_back(r.to);} std::sort(currencies.begin(),currencies.end());currencies.erase(std::unique(currencies.begin(),currencies.end()),currencies.end());
 std::map<std::string,int> ix; for(int i=0;i<(int)currencies.size();++i)ix[currencies[i]]=i;
 // Apply the transaction fee to every conversion rate.
 const double keep = 1.0 - fee;
 const double eps = 1e-10;

 // Start every currency at zero so negative cycles anywhere
 // in the graph can be detected.
 std::vector<double> d(currencies.size(), 0.0);
 bool bfFound = false;

 // Relax every exchange edge for up to |V| passes.
 for (size_t k = 0; k < currencies.size(); ++k) {
  bool changed = false;

  for (const auto& r : rates) {
   // A profitable exchange cycle becomes a negative-weight cycle
   // after applying the negative logarithm transformation.
   const double w = -std::log(r.rate * keep);
   const int u = ix[r.from];
   const int v = ix[r.to];

   // Update the destination distance when a lower cost is found.
   if (d[v] > d[u] + w + eps) {
    d[v] = d[u] + w;
    changed = true;

    // An update on the |V|th pass signals a negative cycle.
    if (k + 1 == currencies.size()) {
     bfFound = true;
    }
   }
  }

  // Stop early when a full pass makes no changes.
  if (!changed) {
   break;
  }
 }
 std::map<std::pair<int,int>,double> edge;for(auto&r:rates)edge[{ix[r.from],ix[r.to]}]=r.rate;
 std::vector<Cycle> found; std::set<std::string> seen; // cycle canonicalization removes rotational duplicates
 for(int start=0;start<(int)currencies.size();++start){std::vector<int> p{start};std::vector<bool> used(currencies.size(),false);used[start]=true;
  auto dfs=[&](auto&& self,int u,double product)->void{for(int v=0;v<(int)currencies.size();++v){auto it=edge.find({u,v});if(it==edge.end())continue;double next=product*it->second;if(v==start&&p.size()>1){double net=next*std::pow(keep,(double)p.size());if(net>1.0+1e-9){std::vector<int> cyc=p;int minpos=std::min_element(cyc.begin(),cyc.end())-cyc.begin();std::rotate(cyc.begin(),cyc.begin()+minpos,cyc.end());std::string key;for(int q:cyc)key+=currencies[q]+"/";if(seen.insert(key).second){Cycle c;c.gross=next;c.net=net;for(int q:cyc)c.path.push_back(currencies[q]);c.path.push_back(c.path.front());found.push_back(c);}}}else if(!used[v]&&p.size()<currencies.size()){used[v]=true;p.push_back(v);self(self,v,next);p.pop_back();used[v]=false;}}};dfs(dfs,start,1.0);
 }
 std::sort(found.begin(),found.end(),[](const Cycle&a,const Cycle&b){return a.net>b.net;});
 std::ostringstream o;o.precision(10);o<<"{\"bellmanFordFound\":"<<(bfFound?"true":"false")<<",\"count\":"<<found.size()<<",\"amount\":"<<amount<<",\"feePercent\":"<<fee*100<<",\"cycles\":[";
 for(size_t i=0;i<found.size();++i){if(i)o<<",";auto&c=found[i];double final=amount*c.net;o<<"{\"path\":[";for(size_t j=0;j<c.path.size();++j){if(j)o<<",";o<<"\""<<c.path[j]<<"\"";}o<<"],\"grossMultiplier\":"<<c.gross<<",\"netMultiplier\":"<<c.net<<",\"startAmount\":"<<amount<<",\"finalAmount\":"<<final<<",\"profit\":"<<final-amount<<",\"profitPercent\":"<<(c.net-1)*100<<"}";}
 o<<"]}";return o.str();
}
std::string readFile(const std::string&p){FILE*f=fopen(p.c_str(),"rb");if(!f)return "";fseek(f,0,SEEK_END);long n=ftell(f);rewind(f);std::string s(n,'\0');fread(s.data(),1,n,f);fclose(f);return s;}
std::string response(int code,const std::string&type,const std::string&body){std::ostringstream o;o<<"HTTP/1.1 "<<code<<(code==200?" OK":" Not Found")<<"\r\nContent-Type: "<<type<<"\r\nAccess-Control-Allow-Origin: *\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Methods: GET, POST, OPTIONS\r\nContent-Length: "<<body.size()<<"\r\nConnection: close\r\n\r\n"<<body;return o.str();}
int main(int argc,char**argv){int port=argc>1?std::stoi(argv[1]):8080;int server=socket(AF_INET,SOCK_STREAM,0);int one=1;setsockopt(server,SOL_SOCKET,SO_REUSEADDR,&one,sizeof(one));sockaddr_in addr{};addr.sin_family=AF_INET;addr.sin_addr.s_addr=INADDR_ANY;addr.sin_port=htons(port);if(bind(server,(sockaddr*)&addr,sizeof(addr))<0||listen(server,32)<0){perror("server");return 1;}std::cout<<"Currency arbitrage server listening on http://localhost:"<<port<<std::endl;
 while(true){int client=accept(server,nullptr,nullptr);if(client<0)continue;std::string req;char buf[8192];ssize_t n;while((n=recv(client,buf,sizeof(buf),0))>0){req.append(buf,n);if(req.find("\r\n\r\n")!=std::string::npos){auto cl=req.find("Content-Length:");size_t needed=0;if(cl!=std::string::npos){cl+=15;while(cl<req.size()&&req[cl]==' ')cl++;needed=std::stoul(req.substr(cl));}size_t h=req.find("\r\n\r\n")+4;if(req.size()>=h+needed)break;}}
 std::string out;if(req.rfind("OPTIONS ",0)==0)out=response(200,"application/json","{}");else if(req.rfind("GET /api/rates",0)==0)out=response(200,"application/json",ratesJson());else if(req.rfind("POST /api/analyze",0)==0){double amount=1000,fee=0.001;auto body=req.substr(req.find("\r\n\r\n")+4);auto get=[&](const std::string&k,double d){auto p=body.find("\""+k+"\"");if(p==std::string::npos)return d;p=body.find(':',p);if(p==std::string::npos)return d;try{return std::stod(body.substr(p+1));}catch(...){return d;}};amount=get("amount",amount);fee=get("feePercent",fee*100)/100;if(!std::isfinite(amount)||amount<=0)amount=1000;if(!std::isfinite(fee)||fee<0||fee>=1)fee=.001;out=response(200,"application/json",analyze(amount,fee));}else{std::string path="public";auto e=req.find(' ',5);std::string url=e!=std::string::npos?req.substr(4,e-4):"/";if(url=="/")path+="/index.html";else if(url=="/rates"||url=="/rates/")path+="/rates.html";else if(url=="/analysis"||url=="/analysis/")path+="/analysis.html";else path+=url;std::string body=readFile(path);out=body.empty()?response(404,"text/plain","Not found"):response(200,path.ends_with(".css")?"text/css":path.ends_with(".js")?"application/javascript":"text/html",body);}send(client,out.data(),out.size(),0);close(client);
 }
}
