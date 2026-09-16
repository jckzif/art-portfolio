import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const ASCII_ART = String.raw`
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                                                 
                                                                :   .                                           
                                                              &    X                                            
                                                  &      .  :  ; $ . . .                                        
                                              &     & $  &  X..  $+&.  . &                                      
                                          &&&&&&:&. .. &. X&x+ .&X. &&&&X&&                                     
                                         &&;.:..+:+&+$&.&X;.:&$$$&X;.x;&&&&&.                                   
                                  &&   X$X x$+X&&:;.&$:$&;+&x:+.+.& ;&x&+X &    :                               
                                 &; ;$X&x$$ $;&+.:xX:$$&+Xx &..x&&:;;;.&&&;&&&&                                 
                                  $+X...&X$.$;:;+$&&x:;:x.&+&&x&x$Xx&&x:.x& &:&$&&                              
                            : : &&Xx&+;: .X;+$&.x+&$+.&&:XxXX;& &&&&xxX&&+& x.+.&$&                             
                            &$&&&;.&& &;&&&$&&X&&& &.X&xX&&...&&;x&$$&&:&:::&& X&XX&&&                          
                         :.;; .   +&&& +&$& :&:+X ;&&&$&&&&&&&&x&.xx&+&x :X&&.:++XX&:&X                         
                         &&;+; &:&$&&::& .x&&&.X.&&+&&&&&&&&&X&X&:&&&..&X&: X;X XX.;+&  $                       
                        +& :.+&::&X..&:&&$&&&.xxX&&&&X&&&&&&&&&..;;&.&&$.$&X x.&;&X...                          
                         : &Xxx&+&x:&X xxx &+..$x :.; && &&&  x&&+& &&+&.$x;$&x&&&&$&&&&&&                      
                       &&;&. x&X+x&+&.&&&.&&x&;x&&&&&&&.&.. &&.$&:$:;&$&.$x;&..X.&+;&:..:& .                    
                      . : &.:x$;+$.x&&$&$X&&.$.&&&&&&$&x&&&&.$&&&$&&&.x;;X.:&X. Xx$$&X.&.&                      
                       &x.:X+:..X;$X&.&++:$&+&&&$&&.&&&&x+;&&&$$&&&+;x&&X$Xx:.XX&&+X .x&&$&x:                   
                       &.X x;+& & +;.+$$&&&:::X&&& &xX:x +xx+Xx;+:$&x ;;X ;;xx$.&.X.+&&;X:;.&                   
                       &&&&+;&&;&$::+X..XX.XX&.$X&X&. .;&;;::+ x:..:.&&;:.::..X&&X:&&&$&x+&&.                   
                           ;..+:x+.&&X+.xx&&+. :x :$X;x.; . :.xX..;..   .........&&+&&&&&&&+                    
                       & .  X; x.. . .:  . ;+.      :;;.;X$.::..:::.............x;X&&&&&&& .                    
                       &&&X+:& x:..  .  .+.       ;  .;;;;..:...+.;..............;.&$x;. .                      
                        x;$&&&+$      . .    .     . .     ;...:.....::.........;;x+;&X&&&.                     
                          &;.&+..  ..              .     :   .     .   . .... ...&$;XX:&&&&                     
                           Xx:$x.                     ..                   ..... X$XXX.&                        
                          &&.X+&               X        ..       .:x&;;&&&&    . .X&&x.&&                       
                        & X&XX;$     &&& &&&&&&$+.;X... .. .. :X&&&X&$&&x+x&&;:   ;+x&&&& .                     
                         & &:&;$  X;+&$Xx++++.. ....   .  ...:.   .      . : ;.   ;;x$ &.&                      
                        &   &&+.               .:...        ...;&;.  .;x       .  .Xx&  +  .                    
                        & &  X..     .+&&&&&&&&&$&$;      ...:x&&:&&&&; &&&x;....  &$&+:                        
                         &  ;&&     .x: .  &&$;:x&$   . ... .+.&&x&&&& +  .......  $;  Xx &                     
                          X   .          ... .:           . .: ;              ..   +. ;X &                      
                          x&&x.                             ....              .  .    xX                        
                           X.                           ..........       .   .   . &: X:                        
                            + X&                     .      .....   . ..         . &X::                         
                             ;;+                  ..          .+;.       ....  .  .$$X                          
                             ..+  :           . .+      .      ..X;         .  ...$ ..                          
                             .           ..    .:                 +.  : ..... +   . ..   .                      
                              .               .. ;x$&&& ....&&&$.+;;:   ... .. .. ..;.                          
                               x;:.                ;$:;X$XX.. +:....:..  .... . .+;;                            
                                  .  ..   .               ..:....: ....   ....  .                               
                                  .                 ..  ;:  .::;............  . .                               
                                          ..    .                ..........    ..                               
                                   .    .      .. ..$$XXx+XX+x;:  .  ... .......                                
                                    .  ..    ;&&. ;    :+;&&X;x$&&&&;.....; ..    .                             
                                     .     ...                      ......  ...                                 
                                      .   .     ..::xXx&&&&&+:..:.;..........:  &&&&&;                          
                                      :.   .. . ...           :::........ .... &&&&&                            
                                      : ..    ..      .     .. . ........... .&&&&& .                           
                         :+&          + ..:.   . . .    .. ......:.:......... &&&&        .                     
                        .&&&&   &&&+  :    :;.          .....::;... ....... ..&&&   .   ..                      
                         &&&&& &   +&&.     .x:.  .. ...............:........+&;             .                  
                           &&&&X   ;&x..      .:$:....:.........:::.....:...;&      .   .     :                 
                     ..      &&x;x;X&        .   .;+;;:...:..:.............x&  .  .  . ; :.                     
                     . .:      &;&&& . . . ..       ..:..................;&&      :.   . . .    .               
                            .    & ;.. .              .............:.. .X&         .  :   .  .   .     .        
                                   &$: ....           . ..............:&:    . .   . . :....  .  ..             
                                 .   $..    .              .....:.. :x&. ...... .      .  . .  ..    +:         
                             ;         x:..    .           .. ...:.;&.   .    .. : . .. :..           .         
                                         X..              . ..:::;&&    .   .   .    .:       :      .          
                            x              x .      .......::;..+$    :     .  :  .:.               &;          
                                  .    + + ..;. ..;.   . .. ..:x    .  ... :.   ;.             ;& &.            
                .                             ;.     ......:;x     X + X + . :+.         .   &X;.x.   .  .      
                                       .&       $:. .     ..     . . & &           .       &$. &;     ;     :.  
     .:       x          .              & x       $:.  ....         . :&+            :  $&x  .X.     ..;+       
             .         .                &$          X  ..                         .  Xx&.  :x       .:.         
           :..            &&                         &+; .  ;             .   .   .;:... &X$.    .;X            
          : .:               &&&          .                             :    ..   : . .& .     . .              
         .                       $             .       . ::  .   X       .  .   .$ x&.                  .       
            .                        :                  .      . .& .;$:..;$.  .                                
 :     .   +.                            .                                       .x                             
       . . ..                               .         .  &     :           :  .x         .  .                   
        .. +                      +    .                                                      .                 
                                                                                                                
`;

export async function middleware(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const accept = request.headers.get('accept') || '';

  if (request.nextUrl.pathname === '/' && (ua.toLowerCase().includes('curl') || accept.toLowerCase().includes('text/plain'))) {
    return new NextResponse(ASCII_ART.trim(), {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }

  let response = NextResponse.next({ request });

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (items: Array<{ name: string; value: string; options?: Record<string, unknown> }>) => {
          items.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if ((!user || user.app_metadata?.role !== 'admin') && request.nextUrl.pathname.startsWith('/admin')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.set('login', '1');
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = { matcher: ['/', '/admin/:path*'] };
