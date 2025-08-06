import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import { openLoginModal, closeLoginModal } from "@/lib/store/slices/loginSlice";
import jsSHA from 'jssha';

export default function SamSungSSOComponent() {
  const dispatch = useAppDispatch();
  const { isLogged } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (isLogged) {
      dispatch(closeLoginModal());
      
      const generateSamsungSSO = async () => {
        
        const key = 'SNr4BMj1ISIvvAZIppl9PHiqh8lr1G2iEc8wc6jqmyRqeGmwwl0AxintWRtvJRvDM3/6luy53EXmWWkZSTK3ITpceZHr6lEUPIdtazGYn3j15dxD90MSLBxeHv3o+vGGJZqlT1a+GGYsIPY9fI8MnMqDPjYsNMhjzpHx9R8G1Ek=';
        const ud_t = Math.round(Date.now() / 1000);
        const ud_s = 'vn_FPLAY_04599373';
        
        const shaObj = new jsSHA("SHA-512", "TEXT", {
          hmacKey: { value: key, format: "B64" },
        });
        
        shaObj.update(`?ud_s=${ud_s}|ud_t=${ud_t}`);
        let ud_h = shaObj.getHash("B64");
        
        if (ud_h.includes('/')) {
          ud_h = ud_h.replaceAll("/", "%2F");
        }
        if (ud_h.includes('+')) {
          ud_h = ud_h.replaceAll("+", "%2B");
        }
        
        const samsung_url = `https://shop.samsung.com/vn/multistore/vnepp/vn_fptplay/login/externalSSO?ud_t=${ud_t}&ud_h=${ud_h}&ud_s=${ud_s}`;
        
        console.log('ud_h', ud_h);
        console.log('url', samsung_url);
        
        setTimeout(() => {
          window.location.href = samsung_url;
        }, 1000);
        
      };

      generateSamsungSSO();
    } else {
        dispatch(openLoginModal());
    }
  }, [isLogged, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl font-bold mb-4">Samsung SSO</div>
        {isLogged ? (
          <div>
            <div className="text-lg mb-2">Redirecting to Samsung...</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        ) : (
          <div>
            <div className="text-lg mb-2">Please login to continue</div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        )}
      </div>
    </div>
  );
}
