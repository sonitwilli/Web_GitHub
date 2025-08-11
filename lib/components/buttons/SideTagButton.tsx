import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/router";
import { watchSingleDocument } from "@/lib/plugins/firebase";
import tracking from "@/lib/tracking";
import { trackingStoreKey } from "@/lib/constant/tracking";
import { PROFILE_TYPES, TYPE_PR, NUMBER_PR } from "@/lib/constant/texts";
import useScreenSize from "@/lib/hooks/useScreenSize";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  setSidetagPosition,
  clearSidetagPosition,
  changeListFloatBubbles,
} from "@/lib/store/slices/sidetagSlice";
import { useChatbot } from "@/lib/hooks/useChatbot";

interface FloatBubbleItem {
  icon: string;
  title: string;
  url: string;
  type?: string;
}

interface FloatBubbleCoordinates {
  x: string;
  y: string;
}

export interface FloatBubble {
  _id: string;
  position: string;
  status: string;
  page_key: string;
  bg_color: string;
  coordinates: FloatBubbleCoordinates;
  items: FloatBubbleItem[];
  isDisplay?: boolean;
  floatBubbleStyle?: string;
}

interface FirebaseFloatBubbleResponse {
  data: FloatBubble[];
}

const SideTagButton: React.FC = () => {
  const router = useRouter();
  const { width } = useScreenSize();
  const dispatch = useAppDispatch();
  const { clickChatbot } = useChatbot();
  const [listFloatBubbles, setListFloatBubbles] = useState<FloatBubble[]>([]);
  const { info } = useAppSelector((s) => s.user);
  useEffect(() => {
    dispatch(changeListFloatBubbles(listFloatBubbles));
  }, [listFloatBubbles, dispatch]);

  // Check if user is mobile or tablet
  const isMobile = useMemo(() => {
    return width <= 1280;
  }, [width]);

  // Get profile type from localStorage
  const profileType = useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(TYPE_PR);
    }
    return null;
  }, []);

  // Get current user from localStorage
  const currentUser = useMemo(() => {
    if (typeof window !== "undefined") {
      const currentUserData = localStorage.getItem("user");
      if (currentUserData) {
        try {
          return JSON.parse(currentUserData);
        } catch {
          return null;
        }
      }
    }
    return null;
  }, []);

  // Check if should display float bubbles
  const shouldDisplay = useMemo(() => {
    return (
      (!currentUser || profileType !== PROFILE_TYPES.KID_PROFILE) &&
      listFloatBubbles?.length &&
      !isMobile
    );
  }, [currentUser, profileType, listFloatBubbles, isMobile]);

  // Parse inset position from style string
  const parseInsetPosition = useCallback((styleString: string) => {
    if (!styleString) return "";

    const insetMatch = styleString.match(/inset:\s*([^;]+)/);
    if (!insetMatch) return "";

    const insetValue = insetMatch[1].trim();
    const values = insetValue.split(" ");

    // inset: top right bottom left
    if (values.length === 4) {
      const [top, right, bottom, left] = values;

      // Check which sides have px values (not auto)
      const hasTop = top !== "auto" && top.includes("px");
      const hasRight = right !== "auto" && right.includes("px");
      const hasBottom = bottom !== "auto" && bottom.includes("px");
      const hasLeft = left !== "auto" && left.includes("px");

      // Determine position based on which sides have values
      let position = "";
      if (hasRight && hasBottom) {
        position = "right bottom";
      } else if (hasRight && hasTop) {
        position = "right top";
      } else if (hasLeft && hasBottom) {
        position = "left bottom";
      } else if (hasLeft && hasTop) {
        position = "left top";
      }

      return position;
    }

    return "";
  }, []);

  // Handle image error
  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const target = e.target as HTMLImageElement;
      target.src = "/images/error-image.png";
    },
    []
  );

  // Check if page should display float bubble
  const checkDisplayFloatBubble = useCallback(
    (pageKey: string) => {
      const currentPath = router.asPath;
      const currentPageParam = router.query;

      if (pageKey === "home" || pageKey === "/") {
        if (currentPath === "/" || currentPageParam?.id === "home") {
          return true;
        }
        return false;
      } else if (
        currentPageParam?.id === pageKey ||
        currentPath.includes(pageKey)
      ) {
        return true;
      } else {
        return false;
      }
    },
    [router.asPath, router.query]
  );

  // Handle position styling
  const handleSetPosition = useCallback(
    (
      position: string,
      coordinatesX: number | string = 0,
      coordinatesY: number | string = 0
    ) => {
      const defaultBorder = "12px";
      switch (position?.toUpperCase()) {
        case "BR": {
          let borderRadius = "";
          if (coordinatesX === 0 || coordinatesX === "0") {
            borderRadius = `border-radius: ${defaultBorder} 0 0 ${defaultBorder}`;
          }
          return `inset: auto ${coordinatesX}px ${coordinatesY}px auto;${borderRadius}`;
        }
        case "BL": {
          let borderRadius = "";
          if (coordinatesX === 0 || coordinatesX === "0") {
            borderRadius = `border-radius: 0 ${defaultBorder} ${defaultBorder} 0`;
          }
          return `inset: auto auto ${coordinatesY}px ${coordinatesX}px; ${borderRadius}`;
        }
        case "TR": {
          let borderRadius = "";
          if (coordinatesX === 0 || coordinatesX === "0") {
            borderRadius = `border-radius: ${defaultBorder} 0 0 ${defaultBorder}`;
          }
          return `inset: ${coordinatesY}px ${coordinatesX}px auto auto; ${borderRadius}`;
        }
        case "TL": {
          let borderRadius = "";
          if (coordinatesX === 0 || coordinatesX === "0") {
            borderRadius = `border-radius: 0 ${defaultBorder} ${defaultBorder} 0`;
          }
          return `inset: ${coordinatesY}px auto auto ${coordinatesX}px; ${borderRadius}`;
        }
        default: {
          let borderRadius = "";
          if (coordinatesX === 0 || coordinatesX === "0") {
            borderRadius = `border-radius: ${defaultBorder} 0 0 ${defaultBorder}`;
          }
          return `inset: auto ${coordinatesX}px ${coordinatesY}px auto; ${borderRadius}`;
        }
      }
    },
    []
  );

  // Process side tag info from Firebase data
  const getSideTagInfo = useCallback(
    (data: FirebaseFloatBubbleResponse) => {
      if (!data || !data?.data) return;

      const filteredBubbles = data?.data?.filter(
        (item: FloatBubble) =>
          item.status === "1" && checkDisplayFloatBubble(item.page_key)
      );

      if (!filteredBubbles || !filteredBubbles?.length) {
        setListFloatBubbles([]);
        dispatch(clearSidetagPosition());
        return;
      }

      const processedBubbles = filteredBubbles.map((item: FloatBubble) => {
        const { bg_color, coordinates, position, page_key } = item;
        const isDisplay = checkDisplayFloatBubble(page_key);
        const positionStyle = handleSetPosition(
          position,
          coordinates?.x,
          coordinates?.y
        );
        const style = `background: ${bg_color};${positionStyle}`;

        return {
          ...item,
          isDisplay,
          floatBubbleStyle: style,
        };
      });

      // Parse and dispatch sidetag position from the first bubble
      if (processedBubbles.length > 0) {
        const firstBubble = processedBubbles[0];
        const parsedPosition = parseInsetPosition(
          firstBubble.floatBubbleStyle || ""
        );

        dispatch(
          setSidetagPosition({
            position: parsedPosition,
            hasPosition: !!parsedPosition,
          })
        );
      } else {
        dispatch(clearSidetagPosition());
      }

      setListFloatBubbles(processedBubbles);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checkDisplayFloatBubble, handleSetPosition]
  );

  // Initialize side tag data from Firebase
  const initSideTag = useCallback(() => {
    const floatIconPath = `floating_bubble`;
    const floatDocumentId = `floating_buble_web`;

    watchSingleDocument(
      floatIconPath,
      floatDocumentId,
      (data) => {
        if (data && "data" in data) {
          getSideTagInfo(data as FirebaseFloatBubbleResponse);
        }
      },
      () => {
        // Handle error if needed
        console.error("Failed to watch floating bubble document");
      }
    );
  }, [getSideTagInfo]);

  // Handle float item click
  const handleClickFloatItem = useCallback((item: FloatBubbleItem) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sidetag_item_clicked", JSON.stringify(item));

      tracking({
        LogId: "108",
        Event: "AccessItem",
        ItemName: item?.title || "",
        ItemId: item?.url?.includes("khoanh-khac-2024") ? "YearInReview" : "",
        Screen: "Function",
        Url: item?.url || "",
        profile_id: localStorage.getItem(NUMBER_PR) || "",
        profile_session:
          sessionStorage.getItem(trackingStoreKey.PROFILE_SESSION) || "",
      });

      if (item?.type === "chatbot") {
        clickChatbot();
      } else {
        window.open(item.url, "_blank");
      }
    }
  }, [clickChatbot]);

  // Initialize on mount and route changes
  useEffect(() => {
    initSideTag();
  }, [initSideTag]);

  // Parse CSS string to object
  const parseCSSString = useCallback((cssString: string) => {
    const styleObj: Record<string, string> = {};
    if (!cssString) return styleObj;

    const declarations = cssString.split(";").filter((decl) => decl.trim());
    declarations.forEach((decl) => {
      const [property, value] = decl.split(":").map((s) => s.trim());
      if (property && value) {
        // Convert kebab-case to camelCase
        const camelProperty = property.replace(/-([a-z])/g, (g) =>
          g[1].toUpperCase()
        );
        styleObj[camelProperty] = value;
      }
    });
    return styleObj;
  }, []);

  // Re-initialize when route path changes
  useEffect(() => {
    initSideTag();
  }, [router.asPath, initSideTag]);

  if (!shouldDisplay) {
    return null;
  }

  return (
    <>
      {listFloatBubbles.map((bubble, index) => {
        const floatStyle = bubble.floatBubbleStyle
          ? parseCSSString(bubble.floatBubbleStyle)
          : {};

        return (
          <div
            key={index}
            className="py-4 px-3 z-10 rounded-xl flex flex-col gap-5 w-min sm:flex hidden items-end"
            style={{
              background: bubble.bg_color,
              position: "fixed",
              zIndex: 10,
              ...floatStyle,
            }}
          >
            {bubble?.isDisplay &&
              bubble?.items?.map((item, i) => {
                if (item?.type === "chatbot") {
                  if (info?.chatbot !== "1") {
                    return null;
                  }
                }
                return (
                  <div
                    key={i}
                    className="cursor-pointer text-center overflow-hidden min-w-20 flex flex-col items-center"
                    onClick={() => handleClickFloatItem(item)}
                  >
                    {item?.icon && (
                      <img
                        src={item.icon}
                        className="max-w-none object-cover"
                        alt=""
                        onError={handleImageError}
                      />
                    )}
                    {item?.title && (
                      <div className="w-full min-w-20 text-xs font-semibold text-ellipsis mt-2 overflow-hidden break-words line-clamp-2">
                        {item.title}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </>
  );
};

export default SideTagButton;