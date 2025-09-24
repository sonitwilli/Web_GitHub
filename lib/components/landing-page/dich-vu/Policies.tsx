import React, { useEffect, useState } from 'react';
import { fetchDataPlans } from '../../../../lib/api/landing-page';
import type { Policies } from './types';

export default function PoliciesComponent() {
  const [policies, setPolicies] = useState<Policies | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const getData = async () => {
      try {
        const d = await fetchDataPlans();
        if (mounted && d) {
          setPolicies(d.policies);
        }
      } catch {}
    };
    
    getData();
    
    return () => {
      mounted = false;
    };
  }, []);

  if (!policies) return null;

  const columns = policies?.columns || [];
  const title = policies?.title || '';

  return (
    <div className="py-20 flex justify-center">
      <div className="w-full sm:w-[90%] mt-10">
        <p className="text-4xl font-bold text-center">{title}</p>
        <div className="pt-12 px-10 grid grid-cols-1 md:grid-cols-3 gap-10 text-[18px] font-light">
          {columns.map((col: string[], colIdx: number) => (
            <div key={colIdx}>
              {col.map((paragraph: string, pIdx: number) => (
                <p
                  key={pIdx}
                  className="py-4"
                  dangerouslySetInnerHTML={{ __html: paragraph }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
