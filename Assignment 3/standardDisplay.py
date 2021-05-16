output = [

]

#def changeOutput(displayString):
    #changes that one line of html in output


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
    return "".join(stream)