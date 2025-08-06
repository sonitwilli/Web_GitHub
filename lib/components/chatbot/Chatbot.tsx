/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CHATBOT_SDK_ERRORS,
  WCHATBOT_CHAT_SESSION,
} from "@/lib/constant/texts";
import { useAppDispatch, useAppSelector } from "@/lib/store";
import {
  changeChatbotOpen,
  changeIsAlreadyRender,
} from "@/lib/store/slices/chatbotSlice";
import { useRouter } from "next/router";
import { isArray } from "lodash";
import { useChatbot } from "@/lib/hooks/useChatbot";
import { useChatbotAiSdk } from "@/lib/hooks/sdk/useChatbotAI";
import styles from "./Chatbot.module.css";
// const CHATBOT_DOMAIN_ORIGIN = process.env.NEXT_PUBLIC_CHATBOT_DOMAIN_URL ?? '';
// const CHATBOT_DOMAIN_ORIGIN = 'http://localhost:9999';
const CHATBOT_DOMAIN_ORIGIN = "https://dev.fptplay.vn";
const CHATBOT_DOMAIN_FULL_URL = `${CHATBOT_DOMAIN_ORIGIN}/chatbot-ai`;

const Chatbot = () => {
  const { listFloatBubbles } = useAppSelector((s) => s.sidetag);
  const { Commands } = useChatbotAiSdk();
  const router = useRouter();
  const { isAlreadyRender, chatbotOpen } = useAppSelector((s) => s.chatbot);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [url, setUrl] = useState("");
  const dispatch = useAppDispatch();
  const { info } = useAppSelector((s) => s.user);
  const { handleGetChatbotPartnerToken } = useChatbot();

  const isValidRoute = useMemo(() => {
    if (!router.isReady) {
      return false;
    }
    // trang search thì true
    if (router.pathname.includes("/tim-kiem")) {
      return true;
    }
    const listBubbleCurrentPage = listFloatBubbles?.find((item) => {
      if (router.pathname === "/") {
        return item.page_key === "home";
      }
      return item.page_key === router.query.id;
    });

    // page_key của list bubble trùng với page hiện tại
    if (listBubbleCurrentPage) {
      const chatbotItem = (listBubbleCurrentPage || {})?.items.find((x) => {
        return x.type === "chatbot";
      });
      return !!chatbotItem;
    } else {
      return false;
    }
  }, [router, listFloatBubbles]);

  useEffect(() => {
    if (chatbotOpen && !isAlreadyRender) {
      setUrl(CHATBOT_DOMAIN_FULL_URL);
      dispatch(changeIsAlreadyRender(true));
    }
  }, [chatbotOpen, isAlreadyRender, dispatch]);

  useEffect(() => {
    const listener = (event: MessageEvent) => handleMessage(event);
    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    iframe.contentWindow?.postMessage(
      { type: "chatbot_open", value: chatbotOpen },
      "*"
    );
  }, [chatbotOpen]);

  const postMessage = (msg: any) => {
    iframeRef.current?.contentWindow?.postMessage(msg, "*");
  };

  const handleReloadChatbot = async () => {
    try {
      const result = await handleGetChatbotPartnerToken();
      if (!result?.require_login) {
        setUrl(`${CHATBOT_DOMAIN_FULL_URL}?time=${new Date().getTime()}`);
      }
    } catch {}
  };

  const handleChatbotEmitEvent = async ({
    args,
  }: {
    [index: string]: number | string;
  }) => {
    if (args && isArray(args) && args[0]) {
      const { code } = args[0];
      if (code === CHATBOT_SDK_ERRORS.AUTH_FAILED) {
        handleReloadChatbot();
      }
    }
  };

  const handleMessage = async (event: MessageEvent) => {
    if (event.origin !== CHATBOT_DOMAIN_ORIGIN) return;
    const { data } = event;
    try {
      switch (data.type) {
        case "chatbot_open":
          if (data.value === false) {
            dispatch(changeChatbotOpen(false));
            sessionStorage.setItem(
              WCHATBOT_CHAT_SESSION,
              new Date().toISOString()
            );
          }
          break;
        case "chatbot_new_session":
          sessionStorage.setItem(
            WCHATBOT_CHAT_SESSION,
            new Date().toISOString()
          );
          break;
        // case 'chatbot_send_request':
        //   if (data.value?.text) {
        //     trackingRequestChatbot({
        //       ItemName: data.value.text.slice(0, 50),
        //       Status: data.value.status,
        //     });
        //   }
        //   break;
        // case 'chatbot_user_reaction':
        //   const reaction = data.value?.reaction;
        //   if (reaction === 'like') {
        //     trackingFeedbackChatbot({ ItemName: 'OK' });
        //   } else if (reaction === 'dislike') {
        //     const str = `${
        //       data.value.reason
        //     }#${data.value.otherReasonText?.slice(0, 50)}`;
        //     trackingFeedbackChatbot({ ItemName: str });
        //   }
        //   break;
        case 1:
          if (Commands.hasOwnProperty(data.command)) {
            try {
              /*@ts-ignore*/
              const result = await Commands[data.command](
                ...(data?.args || [])
              );
              postMessage({ type: 2, id: data.id, result });
            } catch (err: any) {
              postMessage({
                type: 2,
                id: data.id,
                result: null,
                error: {
                  code: 0,
                  message: err,
                  detail: err,
                },
              });
            }
          } else {
            postMessage({
              type: 2,
              id: data.id,
              result: null,
              error: {
                code: 0,
                message: "has no command data",
                detail: "has no command data",
              },
            });
          }
          break;
        case 3:
          handleChatbotEmitEvent(data as any);
          break;
        default:
          break;
      }
    } catch (err) {
      console.error("Error handling chatbot message:", err);
    }
  };

  if (info?.profile?.profile_type !== "1") return null;

  return (
    <>
      <div
        id="chatbot"
        className={`${styles.chatbot} ${
          chatbotOpen && isValidRoute ? "" : "hidden"
        }`}
      >
        <iframe
          ref={iframeRef}
          /*@ts-ignore*/
          src={url || null}
          className={`${styles["chatbot-iframe"]}`}
          style={{ border: "none" }}
        />
      </div>
    </>
  );
};

export default Chatbot;
