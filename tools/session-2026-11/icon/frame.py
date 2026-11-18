from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np
SRC='/home/claude/shots/'
F='/usr/share/fonts/truetype/google-fonts/Poppins-'
W,H=1080,1920
def bg():
    y,x=np.mgrid[0:H,0:W];d=np.sqrt(((x-540)/W)**2+((y-1150)/H*0.9)**2)
    c0=np.array([0x2f,0x5b,0xb4]);c1=np.array([0x14,0x2c,0x66]);c2=np.array([0x0a,0x18,0x3e])
    t=np.clip(d/0.75,0,1)[...,None];col=np.where(t<0.45,c0+(c1-c0)*(t/0.45),c1+(c2-c1)*((t-0.45)/0.55))
    return Image.fromarray(col.astype('uint8'),'RGB').convert('RGBA')
def wrap(d,text,font,maxw):
    words=text.split();lines=[];cur=''
    for w in words:
        t=(cur+' '+w).strip()
        if d.textlength(t,font=font)<=maxw:cur=t
        else:lines.append(cur);cur=w
    lines.append(cur);return lines
def make(src,title,sub,out):
    im=bg();d=ImageDraw.Draw(im)
    ft=ImageFont.truetype(F+'Bold.ttf',78);fs=ImageFont.truetype(F+'Medium.ttf',38)
    y=150
    for ln in wrap(d,title,ft,W-140):
        d.text((W//2,y),ln,font=ft,fill=(255,255,255),anchor='ms');y+=92
    y+=4
    for ln in wrap(d,sub,fs,W-180):
        d.text((W//2,y),ln,font=fs,fill=(150,220,255),anchor='ms');y+=52
    # phone
    shot=Image.open(SRC+src).convert('RGB')
    top=410;ph_h=H-top-70;sc_h=ph_h-56;sc_w=int(sc_h*shot.size[0]/shot.size[1]);ph_w=sc_w+56
    px=(W-ph_w)//2;py=top
    sh=Image.new('RGBA',im.size,(0,0,0,0));ImageDraw.Draw(sh).rounded_rectangle((px+10,py+24,px+ph_w+10,py+ph_h+24),radius=78,fill=(0,0,0,150));im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(26)))
    d=ImageDraw.Draw(im)
    d.rounded_rectangle((px,py,px+ph_w,py+ph_h),radius=78,fill=(18,20,28))
    d.rounded_rectangle((px+3,py+3,px+ph_w-3,py+ph_h-3),radius=75,outline=(70,78,98),width=3)
    s=shot.resize((sc_w,sc_h),Image.LANCZOS)
    m=Image.new('L',(sc_w,sc_h),0);ImageDraw.Draw(m).rounded_rectangle((0,0,sc_w-1,sc_h-1),radius=54,fill=255)
    im.paste(s,(px+28,py+28),m)
    im.convert('RGB').save(out)
S=[('n-body.png','Explore the human body in 3D','Rotate, zoom and tap any structure','1-3d-body.png'),
   ('n-fcps.png','1,806 FCPS Part I questions','Daily drills, subject practice and mock exams','2-fcps.png'),
   ('n-qbank.png','Learn from every answer','Explanations and links to the 3D model','3-question-bank.png'),
   ('n-systems.png','Every body system, layer by layer','Skeleton, muscles, nerves, vessels and organs','4-systems.png'),
   ('n-lessons.png','Guided 3D lessons','The camera moves to each structure as you learn','5-lessons.png'),
   ('n-clinical.png','Clinical anatomy cases','Connect structure to real problems','6-clinical.png')]
for a in S:make(*a);print(a[3])
p=Image.new('RGB',(6*270,480))
for i,a in enumerate(S):p.paste(Image.open(a[3]).resize((270,480)),(i*270,0))
p.save('preview.png')
