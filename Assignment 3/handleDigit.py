from standardDisplay import *

def handleDigit(digit):
    #write to stream
    stream = getFileContents()
    currNumber = ""
    
    if (len(stream)!=0 and stream[-1].isdigit()):
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



    