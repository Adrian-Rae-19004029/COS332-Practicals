#!/usr/bin/python3
from standardDisplay import *

def handleDigit(digit):
    #write to stream
    stream = getFileContents()
    currNumber = ""


    if(digit=="." and len(stream)!=0):
        currNumber = stream[-1]
        if "." in currNumber:
            currNumber = currNumber
        else:
            currNumber+=str(digit)
            stream[-1] = currNumber      
    elif (len(stream)!=0 and isANumber(stream[-1])):
        currNumber = stream[-1]
        currNumber+=str(digit)
        stream[-1] = currNumber      
    else:
        currNumber+=str(digit)
        stream.append(currNumber)     
    writeJSONToFile(stream)
    
    #display the stream
    changeOutput(streamToString(stream))
    printOutput()



    