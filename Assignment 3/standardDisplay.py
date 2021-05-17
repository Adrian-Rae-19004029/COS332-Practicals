#!/usr/bin/python3
import json

output = [
"Content-type:text/html\r\n\r\n",
	"<!DOCTYPE html>",
"<html>",
"<head>",
    "<title> Basic Caclulator</title>",
"</head>",
"<body>",
    "<table border=1>",
        "<th></th>",
        "<tr>",
            "<td><div><a href='digit7.py'> 7 </a></div></td>",
            "<td><div><a href='digit8.py'> 8 </a></div></td>",
            "<td><div><a href='digit9.py'> 9 </a></div></td>",
            "<td><div><a href='mult.py'> * </a></div></td>",
        "</tr>",
        "<tr>",
            "<td><div><a href='digit4.py'> 4 </a></div></td>",
            "<td><div><a href='digit5.py'> 5 </a></div></td>",
            "<td><div><a href='digit6.py'> 6 </a></div></td>",
            "<td><div><a href='div.py'> / </a></div></td>",
        "</tr>",
        "<tr>",
            "<td><div><a href='digit1.py'> 1 </a></div></td>",
            "<td><div><a href='digit2.py'> 2 </a></div></td>",
            "<td><div><a href='digit3.py'> 3 </a></div></td>",
            "<td><div><a href='sub.py'> - </a></div></td>",
        "</tr>",
        "<tr>",
            "<td><div><a href='digit0.py'> 0 </a></div></td>",
            "<td><div><a href='point.py'> . </a></div></td>",
            "<td><div><a href='equal.py'> = </a></div></td>",
            "<td><div><a href='add.py'> + </a></div></td>",
        "</tr>",
        "<tr>",
            "<td><div colspan=4><a href='clear.py'> Clear </a></div></td>",
        "</tr>",
    "</table>",
"</body>",
"</html>"
]

def changeOutput(displayString):
    #changes that one line of html in output
    output[8] = "<th>"+displayString+"</th>"


def printOutput():
    for line in output:
        print(line)

def writeJSONToFile(j):
    f = open('inputStream.txt', 'w')
    json.dump(j, f)
    f.close()

def getFileContents():
    f = open('inputStream.txt', 'r')
    x = json.load(f)
    f.close()
    return x

def streamToString(stream):
    try:
    	return "".join(stream)
    except Exception as e:
    	return str(stream)
    
def isANumber(num):
    try:
        n=float(num)
        return True
    except Exception as e:
        return False