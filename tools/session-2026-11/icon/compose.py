from PIL import Image,ImageDraw,ImageFilter
import numpy as np
H=Image.open('r_heart.png').convert('RGBA');H=H.crop(H.split()[-1].getbbox())
def bg(S):
    y,x=np.mgrid[0:S,0:S]/S;d=np.sqrt((x-0.5)**2+(y-0.36)**2)
    c0=np.array([0x2f,0x5b,0xb4]);c1=np.array([0x16,0x30,0x6c]);c2=np.array([0x0b,0x1b,0x44])
    t=np.clip(d/0.8,0,1)[...,None];col=np.where(t<0.55,c0+(c1-c0)*(t/0.55),c1+(c2-c1)*((t-0.55)/0.45))
    return Image.fromarray(col.astype('uint8'),'RGB').convert('RGBA')
def compose(S,frac,canvas=None):
    im=canvas if canvas is not None else bg(S)
    h=H.copy();s=frac*S/max(h.size);h=h.resize((int(h.size[0]*s),int(h.size[1]*s)),Image.LANCZOS)
    g=Image.new('RGBA',im.size,(0,0,0,0));a=h.split()[-1].point(lambda v:130 if v>10 else 0)
    glow=Image.new('RGBA',h.size,(90,210,255,0));glow.putalpha(a)
    x=(S-h.size[0])//2;y=(S-h.size[1])//2
    g.alpha_composite(glow,(x,y));g=g.filter(ImageFilter.GaussianBlur(S*0.045))
    im.alpha_composite(g);im.alpha_composite(h,(x,y));return im
ic=compose(512,0.70).convert('RGB');ic.save('icon-512.png')
compose(1024,0.70).convert('RGB').save('icon-1024.png')
compose(432,0.54,Image.new('RGBA',(432,432),(0,0,0,0))).save('fg-432.png')
prev=Image.new('RGB',(1100,700),(240,240,245));m=Image.new('L',(512,512),0);ImageDraw.Draw(m).rounded_rectangle((0,0,511,511),radius=110,fill=255)
prev.paste(ic,(20,20),m)
for i,sz in enumerate((192,120,72,48)):
    mm=Image.new('L',(sz,sz),0);ImageDraw.Draw(mm).ellipse((0,0,sz-1,sz-1),fill=255);prev.paste(ic.resize((sz,sz),Image.LANCZOS),(570+[0,210,350,440][i],40),mm)
dark=Image.new('RGB',(500,150),(30,30,34))
for i,sz in enumerate((120,72,48)):
    mm=Image.new('L',(sz,sz),0);ImageDraw.Draw(mm).ellipse((0,0,sz-1,sz-1),fill=255);dark.paste(ic.resize((sz,sz),Image.LANCZOS),(15+i*160,15),mm)
prev.paste(dark,(570,300));prev.save('preview.png')
