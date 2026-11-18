from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
H=Image.open('r_heart.png').convert('RGBA');H=H.crop(H.split()[-1].getbbox())
W,Ht=1024,500
y,x=np.mgrid[0:Ht,0:W];d=np.sqrt(((x-780)/W)**2+((y-230)/Ht*0.5)**2)
c0=np.array([0x2f,0x5b,0xb4]);c1=np.array([0x14,0x2c,0x66]);c2=np.array([0x0a,0x18,0x3e])
t=np.clip(d/0.75,0,1)[...,None];col=np.where(t<0.45,c0+(c1-c0)*(t/0.45),c1+(c2-c1)*((t-0.45)/0.55))
im=Image.fromarray(col.astype('uint8'),'RGB').convert('RGBA')
h=H.copy();s=430/h.size[1];h=h.resize((int(h.size[0]*s),int(h.size[1]*s)),Image.LANCZOS);hx=W-h.size[0]-70;hy=(Ht-h.size[1])//2+8
g=Image.new('RGBA',im.size,(0,0,0,0));gl=Image.new('RGBA',h.size,(90,210,255,0));gl.putalpha(h.split()[-1].point(lambda v:130 if v>10 else 0));g.alpha_composite(gl,(hx,hy))
im.alpha_composite(g.filter(ImageFilter.GaussianBlur(28)));im.alpha_composite(h,(hx,hy))
d=ImageDraw.Draw(im);F='/usr/share/fonts/truetype/google-fonts/Poppins-'
L=64
d.text((L,150),'3D Human',font=ImageFont.truetype(F+'Bold.ttf',76),fill=(255,255,255),anchor='ls')
d.text((L,236),'Anatomy',font=ImageFont.truetype(F+'Bold.ttf',76),fill=(120,214,255),anchor='ls')
f3=ImageFont.truetype(F+'Medium.ttf',27)
d.text((L,296),'Explore the body in 3D',font=f3,fill=(222,232,255),anchor='ls')
d.text((L,334),'1,806 FCPS Part I questions',font=f3,fill=(222,232,255),anchor='ls')
f4=ImageFont.truetype(F+'Medium.ttf',20)
pill='One-time price  ·  Works offline  ·  No ads'
tw=d.textlength(pill,font=f4);ov=Image.new('RGBA',im.size,(0,0,0,0));ImageDraw.Draw(ov).rounded_rectangle((L,372,L+tw+36,414),radius=21,fill=(255,255,255,28),outline=(120,214,255,255),width=2);im.alpha_composite(ov);d=ImageDraw.Draw(im)
d.text((L+18,400),pill,font=f4,fill=(255,255,255),anchor='ls')
im.convert('RGB').save('feature-graphic.png');print(im.size)
