var fs = require("fs");
var execSync = require("child_process").execSync;
var nl = "\n";
var ebjFile = process.argv[2];
var ebjJson = JSON.parse(fs.readFileSync(ebjFile, 'utf8'));
var paths = ebjJson.paths;
var files = ebjJson.files;
var cmds = ebjJson.cmds;

function getFiles(filen){
	file=files[filen];
	return( execSync("find "+paths[file.p]+" -name \"*"+file.e+"\"")+"").split(nl);
}

function getIOPairs(filen){
	if(filen==null)
		return [[null,null,null]];
	file=files[filen];
	fileo=files[file.o];
	var arr = (execSync("find "+paths[file.p]+" -name \"*"+file.e+"\"")+"").split(nl);
	var rarr=[];
	for(var i=0;i<arr.length-1;i++){
		var str = arr[i];
		str = str.substring(paths[file.p].length,str.length-file.e.length);
		var strs=paths[fileo.p];
		str=strs+str+fileo.e;
		rarr[i]=[arr[i],str,strs];
	}
	return rarr;
}
function replaceAlls(str){
	for(var filen in files){
		str = str.replace("__all"+filen,getFiles(filen).join(" "));
	}
	return str;
}

function main(){
	console.log("Starting to build by "+ebjFile);
	for(var i=0;i<cmds.length;i++){
		var cmd = cmds[i];
		var filen = cmd[1];
		var pairs = getIOPairs(filen);
		for(var j=0;j<pairs.length;j++){
			var filena = (pairs[j][0]+"").split("/");
			var ifilenfl = filena[filena.length-1];
			try{
				var cmdstrbase = replaceAlls(cmd[0]);
				var cmdstr;
				if(filen!=null){
					cmdstr = cmdstrbase
						.replace("__od",pairs[j][2])
						.replace("__in",ifilenfl)
						.replace("__id",pairs[j][0].substring(0,pairs[j][0].length-1-ifilenfl.length))
						.replace("__o",pairs[j][1])
						.replace("__i",pairs[j][0]);
				}else{
					cmdstr=cmdstrbase;
				}
				var stdout = execSync(cmdstr)+"";
				if(stdout!=""&&stdout!=null&&stdout!=nl)
					console.log(stdout);
			}catch(err){
				console.log("An error has occured during building, terminating.");
				return;
			}
		}
	}
	console.log("Finished building without errors durning cmds execution.");
}

main();
