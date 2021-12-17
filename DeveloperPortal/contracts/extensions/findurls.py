import os 
import re
ref = os.path.join(os.getcwd(), "reference")

for file in os.listdir(ref):
    if file.endswith(".md"):
        with open(os.path.join(ref, file), "r") as fd:
            for num, line in enumerate(fd.readlines(), 1):
                matches = re.findall(r"(structure.+)", line) 
                if matches:
                    print(file + '\n')
                    print("Matches found on line %d" %num)
                    for match in matches:
                        print(match)

                    print('\n')