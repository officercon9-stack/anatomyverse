from PIL import Image,ImageDraw,ImageFont,ImageFilter
exec(open('compose.py').read().split('ic=compose')[0])
F='/usr/share/fonts/truetype/google-fonts/Poppins-'
def make(S):
    im=bg(S)
    # heart in the upper part
    h=H.copy();s=0.56*S/max(h.size);h=h.resize((int(h.size[0]*s),int(h.size[1]*s)),Image.LANCZOS)
    x=(S-h.size[0])//2;y=int(S*0.06)
    g=Image.new('RGBA',im.size,(0,0,0,0));glow=Image.new('RGBA',h.size,(90,210,255,0));glow.putalpha(h.split()[-1].point(lambda v:120 if v>10 else 0))
    g.alpha_composite(glow,(x,y));im.alpha_composite(g.filter(ImageFilter.GaussianBlur(S*0.04)));im.alpha_composite(h,(x,y))
    d=ImageDraw.Draw(im)
    def centred(text,font,cy,fill,track=0):
        w=sum(d.textlength(c,font=font) for c in text)+track*(len(text)-1);cx=(S-w)/2
        for c in text:
            d.text((cx,cy),c,font=font,fill=fill,anchor='ls');cx+=d.textlength(c,font=font)+track
    f1=ImageFont.truetype(F+'ExtraBold.ttf' if __import__('os').path.exists(F+'ExtraBold.ttf') else F+'Bold.ttf',int(S*0.155))
    f2=ImageFont.truetype(F+'SemiBold.ttf' if __import__('os').path.exists(F+'SemiBold.ttf') else F+'Bold.ttf',int(S*0.098))
    # soft dark band behind text for contrast
    band=Image.new('RGBA',im.size,(0,0,0,0));ImageDraw.Draw(band).rectangle((0,int(S*0.66),S,S),fill=(6,14,40,150));im.alpha_composite(band.filter(ImageFilter.GaussianBlur(S*0.04)))
    d=ImageDraw.Draw(im)
    centred('3D HUMAN',f1,int(S*0.815),(255,255,255),track=S*0.004)
    centred('ANATOMY',f2,int(S*0.935),(120,214,255),track=S*0.028)
    return im.convert('RGB')
make(1024).save('icon-text-1024.png');i=make(1024).resize((512,512),Image.LANCZOS);i.save('icon-text-512.png')
p=Image.new('RGB',(900,560),(238,238,242));m=Image.new('L',(512,512),0);ImageDraw.Draw(m).rounded_rectangle((0,0,511,511),radius=110,fill=255);p.paste(i,(20,24),m)
for k,sz in enumerate((160,96,64)):
    mm=Image.new('L',(sz,sz),0);ImageDraw.Draw(mm).rounded_rectangle((0,0,sz-1,sz-1),radius=int(sz*.22),fill=255);p.paste(i.resize((sz,sz),Image.LANCZOS),(560+[0,180,300][k],40),mm)
p.save('prev_text.png')
