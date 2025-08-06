import React, { useCallback, useEffect, useRef, useState } from 'react';
import { fetchDataPolicy, fetchDataLandingPage } from '@/lib/api/landing-page';
import { toTitleCase } from '@/lib/utils/formatString';
import { useRouter } from 'next/router';

type SidebarItem = {
  id: string;
  label: string;
};

type Props = {
  slug?: string;
  type?: 'default' | 'dieu-khoan' | 'chinh-sach' | 'non-navbar';
};

type AnyFunction = (...args: unknown[]) => void;

const throttle = (func: AnyFunction, limit: number) => {
  let inThrottle = false;

  return function (this: unknown, ...args: unknown[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

const LandingPageComponent = ({ slug = '', type = 'default' }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [html, setHtml] = useState('');
  const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>('block-1');
  const activeIdRef = useRef<string | null>(activeId);
  const isScrollingRef = useRef<boolean>(false);
  const router = useRouter();
  const { mode } = router.query;

  const romanToArabic = (roman: string): number => {
    const map: Record<string, number> = {
      i: 1,
      iii: 2,
    };
    return map[roman.toLowerCase()] || -1;
  };

  const transformHtml = useCallback(
    (htmlDesktop: string): { html: string; sidebarItems: SidebarItem[] } => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlDesktop, 'text/html');

      doc.querySelectorAll('hr').forEach((el) => el.remove());

      const sidebarNode = doc.querySelector('div.col-sm-12.col-xl-3');
      const sidebarItems: SidebarItem[] = [];

      if (sidebarNode) {
        const sidebarLiElements = sidebarNode.querySelectorAll('li.pb-2');
        sidebarLiElements.forEach((li) => {
          const a = li.querySelector('a');
          let id = a?.getAttribute('href')?.replace('#', '') || '';
          const label = a?.textContent?.trim() || '';

          if (type === 'dieu-khoan' && /^block-[a-z]+$/i.test(id)) {
            const match = id.match(/^block-([a-z]+)$/i);
            const roman = match?.[1];
            if (roman) {
              const num = romanToArabic(roman);
              if (num > 0) id = `block-${num}`;
            }
          }

          if (id && label) {
            sidebarItems.push({ id, label });
          }
        });

        sidebarNode.remove();
      }

      const pTags = doc.querySelectorAll('p');
      pTags.forEach((p) => {
        p.classList.add('py-2');
        const text = p.textContent?.trim();
        if (type === 'default' && text === 'Liên hệ') {
          p.setAttribute('id', 'block-3');
        }
      });

      sidebarItems.forEach(({ id }, idx) => {
        const el = doc.getElementById(id);
        if (el) {
          el.classList.add('scroll-mt-[220px]');
          if (idx !== 0) el.classList.add('mt-[40px]');
        }
      });

      return {
        html: doc.body.innerHTML,
        sidebarItems,
      };
    },
    [type],
  );

  const fetchAndTransform = useCallback(async () => {
    try {
      const path = slug || window.location.pathname?.slice(1) || '';
      const fetchFn =
        type === 'chinh-sach' ? fetchDataPolicy : fetchDataLandingPage;
      const data = await fetchFn(path, mode as string);
      if (!data?.length) return;

      const htmlDesktop = data[0].block_html?.html_desktop || '';
      const { html, sidebarItems } = transformHtml(htmlDesktop);
      setHtml(html);
      setSidebarItems(sidebarItems);
    } catch {
      setHtml('');
      setSidebarItems([]);
    }
  }, [mode, slug, type, transformHtml]);

  const scrollToElementById = (id: string, updateActiveState = true) => {
    const el = document.getElementById(id);
    if (el) {
      // Set scrolling flag to prevent scroll detection interference
      isScrollingRef.current = true;
      
      if (type === 'dieu-khoan') {
        const yOffset = -220;
        const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      
      // Only update active state after scroll animation if requested
      if (updateActiveState) {
        const isMobile = window.innerWidth < 1024;
        const timeout = isMobile ? 800 : 500;
        
        setTimeout(() => {
          setActiveId(id);
          activeIdRef.current = id;
          isScrollingRef.current = false;
        }, timeout);
      } else {
        // Clear scrolling flag immediately if not updating active state
        const isMobile = window.innerWidth < 1024;
        const timeout = isMobile ? 800 : 500;
        
        setTimeout(() => {
          isScrollingRef.current = false;
        }, timeout);
      }
    } else {
      requestAnimationFrame(() => scrollToElementById(id, updateActiveState));
    }
  };

  const handleClick = (id: string) => {
    // Scroll first, active state will be updated after animation completes
    scrollToElementById(id, true);
    
    // Update URL after scroll animation finishes
    if (router.isReady) {
      // Use longer timeout for mobile devices
      const isMobile = window.innerWidth < 1024;
      const timeout = isMobile ? 900 : 600;
      
      setTimeout(() => {
        router.replace(`${router.asPath.split('#')[0]}#${id}`, undefined, { shallow: true });
      }, timeout);
    }
  };

  useEffect(() => {
    fetchAndTransform();
  }, [fetchAndTransform]);

  useEffect(() => {
    if (!html || !sidebarItems.length) return;

    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      if (sidebarItems.some(item => item.id === id)) {
        setActiveId(id);
        activeIdRef.current = id;
      }
      scrollToElementById(id, false); // Don't update active state for initial hash scroll
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [html, sidebarItems]);

  useEffect(() => {
    const onScroll = throttle(() => {
      if (!sidebarItems.length || isScrollingRef.current) return;

      let newActiveId: string | null = null;
      for (const { id } of sidebarItems) {
        const el = document.getElementById(id);
        if (!el) continue;

        const rect = el.getBoundingClientRect();
        
        const hasScrollMt = el.classList.contains('scroll-mt-[220px]');
        let offset: number;
        
        if (hasScrollMt) {
          const isMobile = window.innerWidth < 1024;
          offset = isMobile ? 240 : 340;
        } else {
          offset = 220;
        }
        
        if (rect.top - offset <= 0) {
          newActiveId = id;
        }
      }

      if (newActiveId && activeIdRef.current !== newActiveId) {
        activeIdRef.current = newActiveId;
        setActiveId(newActiveId);
      }
    }, 100);

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [sidebarItems]);

  return (
    <div className="flex flex-col gap-8 mx-5 sm:mx-15 xl:mx-55">
      {type !== 'non-navbar' && sidebarItems.length > 1 && (
        <div
          className={`sticky top-0 bg-smoky-black w-full ${
            sidebarItems.length > 2 ? 'h-[210px]' : 'h-[180px]'
          }  lg:h-[180px] 2xl:h-[220px] flex lg:justify-center items-end pb-4 lg:pb-8 z-1`}
        >
          <ul className="w-fit flex flex-col lg:flex-row">
            {sidebarItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleClick(item.id)}
                className={`cursor-pointer leading-[130%] tracking-[0.64px] px-5 py-2 text-[15px] sm:text-[16px] lg:text-[23px] 2xl:text-[32px]
                  font-semibold border-davys-grey border-l-2 lg:border-l-0 lg:border-b-2 ${
                    activeId === item.id
                      ? 'border-white text-white '
                      : 'text-davys-grey hover:text-white'
                  }`}
              >
                {toTitleCase(item.label)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {type === 'non-navbar' && (
        <div className={`sticky top-0 bg-smoky-black w-full h-[80px]`}></div>
      )}

      <div
        ref={containerRef}
        className={`flex-1 text-base pb-20 px-1 ${
          sidebarItems.length > 1 ? 'mt-[-20px]' : 'pt-20'
        }`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default LandingPageComponent;
