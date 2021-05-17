#!/usr/bin/python3
from standardDisplay import *

def handleOperator(operator):
    #write to stream
    stream = getFileContents()
    if (operator=="="):
        result = processStream(stream)
        #display the stream
        changeOutput(result)
        printOutput()     
    else:
        if (len(stream)!=0 and isANumber(stream[-1])):
            #add operator to stream
            stream.append(operator)
            #error handling for badly placed operator     
            writeJSONToFile(stream)
            #display the stream
            changeOutput(streamToString(stream))
            printOutput()

    

def processStream(stream):
    #lets assume valid: it looks like [x,+,y,*,z,-,k]
    finished = False
    i = 0;
    while (not finished):
        if(stream[i]=="*" or stream[i]=="/"):
            op = stream[i]
            leftOp = float(stream[i-1])
            rightOp = float(stream[i+1])
            calcValue = 0;
            if(stream[i]=="*"):
                calcValue = str(leftOp*rightOp)
            if(stream[i]=="/" and stream[i+1]=="0"):
                #then reset to original page
            else:
                calcValue = str(leftOp/rightOp)
            stream = stream[0:i-1]+[calcValue]+stream[i+2:]
            i = -1
        i = i+1;
        if(i==len(stream)):
            finished = True
    
    finished = False
    j = 0;
    while (not finished):
        if(stream[j]=="+" or stream[j]=="-"):
            op = stream[j]
            leftOp = float(stream[j-1])
            rightOp = float(stream[j+1])
            calcValue = 0;
            if(stream[j]=="+"):
                calcValue = str(leftOp+rightOp)
            else:
                calcValue = str(leftOp-rightOp)
            stream = stream[0:j-1]+[calcValue]+stream[j+2:]
            j = -1
        j = j+1;
        if(j==len(stream)):
            finished = True 
    writeJSONToFile(stream)
    return str(stream[0])               

