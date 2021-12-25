import os 
import re
ref = os.path.join(os.getcwd(), "reference")

for file in os.listdir(ref):
    if file.endswith(".md"):
        with open(os.path.join(ref, file), "r") as fd:
            article = fd.read()
        with open(os.path.join(ref, file), "w") as fd:
            # fd.write(article.replace("https://community.sana-commerce.com/docs/SCC_Guides/Extensions/how-to/", "https://community.sana-commerce.com/docs/SCC_Guides/Extensions/how-to"))
            # matches = re.findall(r"\(https://community.sana-commerce.com/docs/SCC_Guides/Extensions/how-to/.+\)", article)
            # for match in matches:
            #     print(match)
            #     article = article.replace(match, match.replace(".md", ".html"))
            fd.write(article.replace("https://community.sana-commerce.com/docs/SCC_Guides/Extensions/how-to/", "https://community.sana-commerce.com/docs/SCC_Guides/Extensions/how-to"))