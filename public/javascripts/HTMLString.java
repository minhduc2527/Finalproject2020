package com.srccdoes.Jsoup;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintStream;

import org.jsoup.Jsoup;  
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import java.util.ArrayList;
 
public class HTMLString {  
   public static void main( String[] args ) throws IOException{  
       Document doc = Jsoup.connect("https://www.citypopulation.de/en/vietnam/").get();  
       Elements links = doc.body().select("div>div>div>ul>li>a[href]");
       ArrayList<String> URL = new ArrayList<String>();
       ArrayList<String> Text = new ArrayList<String>();
       PrintStream out = new PrintStream(
      	        new FileOutputStream("/Users/hung8585/Desktop/output.csv", true), true);
          Document doc2 = null;
          System.setOut(out);
       String province = null;
       System.out.println("Province ; District ; Ward ; Population ; Density ");
       for (Element link : links) {  
    	   URL.add(link.attr("abs:href"));
    	   Text.add(link.text()); 
       }   
       for(String num: URL ) {
    	   try {
               doc2 = Jsoup.connect(num).get();
               
              } catch (IOException e) {
               
               e.printStackTrace();
              }
    	  Elements Province = doc2.select("table").select("tbody.admin0").select("tr").select("td");
    	   for (Element table : doc2.select("table").select("tbody")) {
               for (Element row : table.select("tr")) {
                   Elements tds = row.select("td");
                   if(tds.get(1).text().equals("Rural District") || tds.get(1).text().equals("Urban District") || tds.get(1).text().equals("District-level City")|| tds.get(1).text().equals("District-level Town") ) {
                	   province = tds.get(0).text();
                   }
                   else if (tds.get(1).text().equals("Province") ||tds.get(1).text().equals("Municipality")) {
                   }
                   else {
                	   System.out.println(Province.get(0).text()+" ; "+ province + " ; " + tds.get(0).text() + " ; " + tds.get(2).text() + " ; " + tds.attr("data-density"));}
               }
           }
       }
   }
   
}