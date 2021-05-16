import json
import random
from standardDisplay import *

def handleOperator(operator):
    #write to stream
    stream = getFileContents()
    if (operator=="="):
        processStream(stream)
            
    else:
        if (len(stream)!=0 and stream[-1].isdigit()):
            #add operator to stream
            stream.append(operator)
            #error handling for badly placed operator     
        writeJSONToFile(stream)

    #display the stream
    #stdDis.changeOutput(streamToString(stream))
    #stdDis.printOutput()

def processStream(stream):
    #lets assume valid: it looks like [x,+,y,*,z,-,k]
    finished = False
    i = 0;
    while (not finished):
        if(stream[i]=="*" or stream[i]=="/"):
            op = stream[i]
            leftOp = stream[i-1]
            rightOp = stream[i+1]
            calcValue = 0;
            if(stream[i]=="*"):
                calcValue = leftOp*rightOp
            else:
                calcValue = leftOp/rightOp
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
            leftOp = stream[j-1]
            rightOp = stream[j+1]
            calcValue = 0;
            if(stream[j]=="+"):
                calcValue = leftOp+rightOp
            else:
                calcValue = leftOp-rightOp
            stream = stream[0:j-1]+[calcValue]+stream[j+2:]
            j = -1
        j = j+1;
        if(j==len(stream)):
            finished = True                
    return 1*stream[0]

printOutput()