import zipfile
from lxml import etree

class EUPBHandler():
    def __init__(self, filename):
        epubzip = zipfile.ZipFile(filename, 'r')
        self.files = {
            ".": {
                "mimetype": epubzip.read("mimetype").decode("utf-8")
            },
            "META-INF": {
                "container.xml": epubzip.read("META-INF/container.xml").decode("utf-8")
            },
            "OEBPS": {
                "images": {
                    f.replace("OEBPS/images/", ""): epubzip.read(f) 
                    for f in epubzip.namelist() if f.startswith("OEBPS/images/")
                },
                "js": {
                    f.replace("OEBPS/js/", ""): epubzip.read(f).decode("utf-8") 
                    for f in epubzip.namelist() if f.startswith("OEBPS/js/")
                },
                "styles": {
                    f.replace("OEBPS/styles/", ""): epubzip.read(f).decode("utf-8") 
                    for f in epubzip.namelist() if f.startswith("OEBPS/styles/")
                }
            }
        } 
        self.files["OEBPS"] |= {
            f.replace("OEBPS/", ""): epubzip.read(f).decode("utf-8") 
            for f in epubzip.namelist() if f.startswith("OEBPS/") and not f.startswith("OEBPS/images/") and not f.startswith("OEBPS/js/") and not f.startswith("OEBPS/styles/")
        }
        epubzip.close()
        
    def rm_bgimg_1(self):
        for file in self.files["OEBPS"]:
            if file.endswith(".xhtml"):
                flag = False
                tree = etree.fromstring(self.files["OEBPS"][file].encode('utf-8'), parser=etree.XMLParser())
                try:
                    div_bgimg_1 = tree.xpath('//div[@class="bgimg-1"]')[0]
                    div_bgimg_1.attrib.pop('class')
                    flag = True
                except:
                    pass
                try:
                    img_bleed_pic = tree.xpath('//p[@class="bleed-pic"]')[0]
                    img_bleed_pic.getparent().remove(img_bleed_pic)
                    flag = True
                except:
                    pass
                try:
                    h1_span = tree.xpath('//h1/span')
                    for id in range(len(h1_span)):
                        h1_span[id].set('style', 'color: black;')
                    flag = True
                except:
                    pass
                if flag:
                    self.files["OEBPS"][file] = etree.tostring(tree, pretty_print=True, encoding='utf-8').decode('utf-8')
                flag = False
                
    def sort_chap(self):
        tree = etree.fromstring(self.files["OEBPS"]["package.opf"], parser=etree.HTMLParser())
        spine_element = tree.xpath('//spine')[0]
        itemref_list = spine_element.xpath('//itemref')
        itemref_list.sort(key=lambda x: x.attrib['idref'])
        spine_element.clear()
        toc = etree.SubElement(spine_element, 'itemref', idref='toc')
        for itemref in itemref_list:
            if itemref.attrib['idref'] != 'toc':
                spine_element.append(itemref)
        tmp: list = etree.tostring(tree, pretty_print=True, encoding='utf-8').decode('utf-8').split('\n')
        tmp.remove('<html>')
        tmp.remove('</html>')
        tmp.remove('  <body>')
        tmp.remove('  </body>')
        self.files["OEBPS"]["package.opf"] = '\n'.join(tmp)
        print(self.files["OEBPS"]["package.opf"])

    def save_epub(self, filename):
        epubzip = zipfile.ZipFile(filename, 'w')
        epubzip.writestr("mimetype", self.files["."]["mimetype"].encode("utf-8"))
        epubzip.writestr("META-INF/container.xml", self.files["META-INF"]["container.xml"].encode("utf-8"))
        for file in self.files["OEBPS"]:
            if not file in ["images", "js", "styles"]:
                epubzip.writestr(f"OEBPS/{file}", self.files["OEBPS"][file].encode("utf-8"))
        for file in self.files["OEBPS"]["images"]:
            epubzip.writestr(f"OEBPS/images/{file}", self.files["OEBPS"]["images"][file])
        for file in self.files["OEBPS"]["js"]:
            epubzip.writestr(f"OEBPS/js/{file}", self.files["OEBPS"]["js"][file].encode("utf-8"))
        for file in self.files["OEBPS"]["styles"]:
            epubzip.writestr(f"OEBPS/styles/{file}", self.files["OEBPS"]["styles"][file].encode("utf-8"))
        epubzip.close()


if __name__ == '__main__':
    epub = EUPBHandler("test.epub")
    epub.rm_bgimg_1()
    epub.sort_chap()
    epub.save_epub("res.zip")
