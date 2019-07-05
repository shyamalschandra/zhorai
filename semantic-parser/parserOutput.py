import sys
import xml.etree.ElementTree as ET
import json
import utils

content = sys.argv[2]
content = content[1:-1].split(', ')
s = utils.getStructure(content)
# dictionary
res = utils.buildDict(s)
if res:
    dictionary = json.dumps(res)
    #output dictionary
    if sys.argv[1] == "Dictionary":
        print(dictionary) if dictionary else print("")

#output ecosystem/animal
if sys.argv[1] == "Topic":
    if res:
        print(next(iter(res)).title()) if next(iter(res)) else print("")
    else:
        for s in content:
            for word in s:
                if utils.isTopic(word):
                    print(word.title()) if word else print("")

#output name
if sys.argv[1] == "Name":
    name = utils.getName(s)
    print(name.title()) if name else None

#output mindmap
if sys.argv[1] == "MindMap":
    map = utils.getMindMap(res)
    emptyMap = {"nodes": [], "links": []}
    if map != {"nodes": [], "links": []}:
        minmdap = json.dumps(map)
        print(minmdap) if minmdap else print("")
