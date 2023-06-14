//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
var request = require('request');
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
const SerpApi = require('google-search-results-nodejs');
const { response } = require("express");
const { parseJSON } = require("jquery");
const { parse } = require("querystring");
const { resolve } = require("path");
const search = new SerpApi.GoogleSearch("d9928775c89ffd68d7ebd8da8238bb5e854ee61a184c0774febd81b11e1777f9");

var query="";
var finale=0;
app.set("view engine","ejs");

app.get("/", function(req, res){
    if(!query)
    {
        res.render("header",{profile:""});
    }
  else
  {
    const params = {
        engine: "google_scholar_profiles",
        mauthors: query,
      };
      
      const callback = function(data) {
        // console.log(data["profiles"]);
        // var size=data["profiles"].length;
        // for(i=0;i<size;i++)
        // {
        //     console.log(data.profiles[i].name);
        // }
        res.render("header",{profile:data.profiles});
      };
      
      // Show result as JSON
      search.json(params, callback);
  }
});

app.post("/",function(req,res){
 query=req.body.search;
 res.redirect("/");
});


app.post("/profile",function(req,res){
  //Author API
  const pflink=req.body.profile_link;
  const params = {
    engine: "google_scholar_author",
    author_id: pflink
  };

  function consmall(str){
    var ans='';
    for(var i=0;i<str.length;i++)
    {
      if(str[i]!==' ')
      {
        if (/[A-Z\W]/.test(str[i]))
      ans+=str[i];
      }
    }
    
    return ans;
  }
  const callback = function(prof) {
    // res.render("profile",{profile:prof});


     //CITATION API
    //  for(i=0;i<data.articles.length;i++)
    //  {
    //   console.log(data.articles[i].citation_id);
    //  }
    // var finale=0;
    
      const param = {
        engine: "google_scholar_author",
        view_op: "view_citation",
        citation_id: prof.articles[0].citation_id
      };
     
      const   call = function(cit) {
        // console.log(prof.search_metadata.status);
        // if(prof.search_metadata.status!=="Success")
      
        /***outer author */
        var str=cit.citation.authors;
        var author=[];
        var s=0;
        author[s]="";
        for(i=0;i<str.length;i++)
        {
          if(str[i]===',')
          {
            s++;
            author[s]="";
          }
          else if(str[i]!==' ')
          author[s]+=str[i];
        }
        for(i=0;i<author.length;i++)
        {
          author[i]=consmall(author[i]);
        }
  
        // console.log(cit.citation.total_citations.cited_by.serpapi_link+'&api_key=027eb4a9208eab13a7560392217e5064c48e1fb1f6b0cb1d7cfde81ea4a2b502');
        // console.log(cit.citation.total_citations.cited_by.total);
        // var url_base=cit.citation.total_citations.cited_by.serpapi_link;
        // var key='&api_key=027eb4a9208eab13a7560392217e5064c48e1fb1f6b0cb1d7cfde81ea4a2b502';
        // var url=url_base+key;
        // console.log(url);
        
      //   //***inner api */
        var res="";
        var n=parseInt(cit.citation.total_citations.cited_by.total/10);
        if(n%10)
        n++;
        /**for page */
        
       for(var j=1;j<=n;j++)
       {
        
          const params = {
            engine: "google_scholar",
            start:res,
            cites:cit.citation.total_citations.cited_by.cites_id
            
          };
          const callback =   function (data) {
            // console.log(data.serpapi_pagination.current);
            // console.log(data.organic_results.length);
            /**for inner articles or number of link in a page*/
            for(var k=0;k<data.organic_results.length;k++)
            {
              // if(data.organic_results.authors)
              // console.log(data.organic_results.authors);
               // console.log(data.organic_results[k].publication_info.authors);
              if(data.organic_results[k].publication_info.authors)
              {
                /**number of author in a particlar inner link */
                var flag=0;
                for(var l=0;l<data.organic_results[k].publication_info.authors.length;l++)
                {
                  // console.log(consmall(data.organic_results[k].publication_info.authors[l].name));
                  if(author.includes(consmall(data.organic_results[k].publication_info.authors[l].name)))
                  {
                    flag=1;
                    break;
                  }
                }
                if(flag===0)
                finale++;
                
  
              }
              
            }
          
          };
          
         search.json(params, callback);
          // if(innapicall.then(data=>console.log(data)))
          // // console.log(finale);
         
          var ind=j*10;
         
           res=ind.toString();
       
          
       }
      
        
        
        // console.log(url);
  
     
      
       
      
      };
       search.json(param, call);
       

    

    
  
       res.render("profile",{profile:prof,final:finale});
  
      };
  
  // Show result as JSON
  search.json(params, callback);




})


app.listen(3000, function(){
  console.log("Server started on port 3000.");
});

// request(url, (error, response, body)=> {
//   console.log(url);
//   if (!error && response.statusCode === 200) {
//   var obj= JSON.parse(body)
//     // console.log("Got a response: ")
//     if(obj.serpapi_pagination.next_link)
//     {
//       url=obj.serpapi_pagination.next_link+'&api_key=027eb4a9208eab13a7560392217e5064c48e1fb1f6b0cb1d7cfde81ea4a2b502';
//       // console.log("hi");
     
//     }
//   }
//    else {
//     console.log("Got an error: ")
//   }
// }) 
