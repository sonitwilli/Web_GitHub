/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useContext, useRef, useState } from 'react';
import { deletePingChannel, pingChannel } from '../api/channel';
import { DRM_MERCHANT_NAMES, PING_DRM_DATA } from '../constant/texts';
import { useAppSelector } from '../store';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import {
  FingerPrintDataType,
  PlayerWrapperContext,
} from '../components/player/core/PlayerWrapper';
import { browserInfo } from '../utils/methods';
import { useRouter } from 'next/router';
import _, { isArray, isObject } from 'lodash';
import { Secure } from '../utils/secure';
import { getMsgErrsApi } from '../constant/msgErrors';
import useCodec from './useCodec';
import {
  PlayerModalType,
  usePlayerPageContext,
} from '../components/player/context/PlayerPageContext';
import { trackingShowContentLog29 } from '../tracking/trackingCommon';

type Props = {
  eventId?: string;
  playVideo?: () => void;
  destroyPlayer?: () => void;
};

export const useDrmPlayer = ({ eventId, playVideo, destroyPlayer }: Props) => {
  const {
    openPlayerNoticeModal,
    dataChannel,
    dataStream,
    isHboGo,
    isQNet,
    isTDM,
    setErrorFairPlay,
    errorFairPlay,
  } = usePlayerPageContext();
  const router = useRouter();
  const playerWrapperCtx = useContext(PlayerWrapperContext);
  const { urlToPlay } = useCodec({ dataChannel, dataStream });
  const { setIp, setFingerPrintData, setShowFingerPrintClient } =
    playerWrapperCtx;

  const { info } = useAppSelector((s) => s.user);
  const intervalPingEnc = useRef(undefined);
  const getIp = async () => {
    try {
      const res = await axios.get('https://checkip.fptplay.net');
      if (setIp) setIp(res?.data || '0.0.0.0');
    } catch {}
  };
  const initNetworkingEngine = useCallback(() => {
    let userId = info?.user_id_str;
    if (isHboGo || isQNet) {
      if (dataStream?.session && dataStream?.operator) {
        const sessionDecode = jwt.decode(dataStream.session, {}) as any;
        if (sessionDecode && sessionDecode.userId) {
          userId = sessionDecode.userId;
        }
      }
    }
    const networkingEngine = window.shakaPlayer.getNetworkingEngine();
    networkingEngine.clearAllRequestFilters();
    networkingEngine.clearAllResponseFilters();

    networkingEngine.registerRequestFilter((type: string, request: any) => {
      if (type !== window.shaka.net.NetworkingEngine.RequestType.LICENSE) {
        return;
      }
      if (isTDM) {
        const packInfo = window.sigmaPacker.getDataPacker(request.body) || {};
        const dt = {
          userId,
          sessionId: dataStream?.session,
          merchantId: DRM_MERCHANT_NAMES.FPTPLAY,
          appId: process.env.NEXT_PUBLIC_SIGMA_APP_ID,
          reqId: packInfo.requestId,
          deviceInfo: packInfo.deviceInfo,
        };
        request.headers['Content-Type'] = 'application/octet-stream';
        request.headers['custom-data'] = btoa(JSON.stringify(dt));
      } else {
        request.headers['dt-custom-data'] = btoa(
          JSON.stringify({
            userId,
            sessionId: dataStream?.session,
            merchant: dataStream?.merchant,
          }),
        );
      }
    });

    networkingEngine.registerResponseFilter((type: string, response: any) => {
      if (isTDM) {
        const StringUtils = window.shaka.util.StringUtils;
        const Uint8ArrayUtils = window.shaka.util.Uint8ArrayUtils;
        if (type == window.shaka.net.NetworkingEngine.RequestType.LICENSE) {
          const wrappedString = StringUtils.fromUTF8(response.data);
          const wrapped = JSON.parse(wrappedString);
          if (response.headers['client-info']) {
            window.sigmaPacker.update(atob(response.headers['client-info']));
          } else if (wrapped.clientInfo) {
            window.sigmaPacker.update(JSON.stringify(wrapped.clientInfo));
          }
          const rawLicenseBase64 = wrapped.license;
          response.data = Uint8ArrayUtils.fromBase64(rawLicenseBase64);
        }
      } else {
        // TODO: add tracking
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream]);
  const initFairPlay = useCallback(
    ({ cb }: { cb?: () => void }) => {
      axios({
        method: 'GET',
        url:
          'https://lic.drmtoday.com/license-server-fairplay/cert/' +
          dataStream?.merchant,
        responseType: 'arraybuffer',
      })
        .then(async (res: any) => {
          let userId = info?.user_id_str;
          if (isHboGo || isQNet) {
            if (dataStream?.session && dataStream?.operator) {
              const sessionDecode = jwt.decode(dataStream.session, {}) as any;
              if (sessionDecode && sessionDecode.userId) {
                userId = sessionDecode.userId;
              }
            }
          }
          const cert = res.arrayBuffer
            ? await res.arrayBuffer()
            : new Uint8Array(res);

          let urlSearchParams: any = null;
          window.shakaPlayer.configure(
            'drm.advanced.com\\.apple\\.fps\\.1_0.serverCertificate',
            cert,
          );
          window.shakaPlayer.configure(
            'drm.initDataTransform',

            (initData: any, initDataType: any, drmInfo: any) => {
              if (initDataType !== 'skd') return initData;

              // 'initData' is a buffer containing an 'skd://' URL as a UTF-8 string.
              const skdUri =
                window.shaka.util.StringUtils.fromBytesAutoDetect(initData);
              urlSearchParams = new URLSearchParams(new URL(skdUri)?.search);
              const contentId =
                window.shaka.util.FairPlayUtils.defaultGetContentId(initData);

              const cert = drmInfo.serverCertificate;
              // const cert = window.shakaPlayer.drmInfo().serverCertificate
              return window.shaka.util.FairPlayUtils.initDataTransform(
                initData,
                contentId,
                cert,
              );
            },
          );

          const networkingEngine = window.shakaPlayer.getNetworkingEngine();
          networkingEngine.clearAllRequestFilters();
          networkingEngine.clearAllResponseFilters();

          networkingEngine.registerRequestFilter((type: any, request: any) => {
            if (
              type !== window.shaka.net.NetworkingEngine.RequestType.LICENSE
            ) {
              return;
            }
            const originalPayload = new Uint8Array(request.body);
            const base64Payload =
              window.shaka.util.Uint8ArrayUtils.toBase64(originalPayload);
            const params =
              'spc=' +
              base64Payload +
              '&assetId=' +
              urlSearchParams?.get('assetId');

            request.headers['Content-Type'] =
              'application/x-www-form-urlencoded';
            request.headers['x-dt-custom-data'] = btoa(
              JSON.stringify({
                userId,
                sessionId: dataStream?.session,
                merchant: dataStream?.merchant,
              }),
            );
            request.body = params;
          });

          networkingEngine.registerResponseFilter(
            (type: any, response: any) => {
              if (
                type !== window.shaka.net.NetworkingEngine.RequestType.LICENSE
              ) {
                return;
              }
              let responseText = window.shaka.util.StringUtils.fromUTF8(
                response.data,
              );
              responseText = responseText.trim();
              if (
                responseText.substr(0, 5) === '<ckc>' &&
                responseText.substr(-6) === '</ckc>'
              ) {
                responseText = responseText.slice(5, -6);
              }
              response.data =
                window.shaka.util.Uint8ArrayUtils.fromBase64(
                  responseText,
                ).buffer;
            },
          );

          if (cb) cb();

          if (errorFairPlay) {
            if (setErrorFairPlay) setErrorFairPlay(false);
          }
        })

        .catch((e: any) => {
          console.log('GET DRMTODAY ERRORS: ', e);
          if (setErrorFairPlay) setErrorFairPlay(true);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dataChannel,
      dataStream,
      info,
      isQNet,
      isHboGo,
      errorFairPlay,
      setErrorFairPlay,
    ],
  );
  const initFairPlaySigma = useCallback(
    ({ cb }: { cb?: () => void }) => {
      let userId = info?.user_id_str;
      if (isHboGo || isQNet) {
        if (dataStream?.session && dataStream?.operator) {
          const sessionDecode = jwt.decode(dataStream.session, {}) as any;
          if (sessionDecode && sessionDecode.userId) {
            userId = sessionDecode.userId;
          }
        }
      }
      fetch(`${process.env.NEXT_PUBLIC_SIGMA_FAIRPLAY_CERT_URL}/fptplay/sigma`)
        // fetch("https://cert.sigmadrm.com/app/fairplay/sigma_packager_lite/demo")
        .then((res) => res.arrayBuffer())
        .then((res: any) => {
          let contentId: any;
          let licenseURL: any;
          window.shakaPlayer.configure({
            drm: {
              servers: {
                'com.apple.fps.1_0':
                  // 'https://license.sigmadrm.com/license/verify/fairplay',
                  process.env.NEXT_PUBLIC_SIGMA_FAIRPLAY_LICENSE_URL,
              },
              advanced: {
                'com.apple.fps.1_0': {
                  serverCertificate: new Uint8Array(res),
                },
              },
            },
          });

          window.shakaPlayer.configure(
            'drm.initDataTransform',
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            (initData: any, type: any, drmInfo: any) => {
              if (type != 'skd') return initData;
              const skdURL =
                window.shaka.util.StringUtils.fromBytesAutoDetect(initData);
              contentId = new URL(skdURL).searchParams.get('assetId');
              const cert = window.shakaPlayer.drmInfo().serverCertificate;
              licenseURL = skdURL.replace('skd://', 'https://');
              return window.shaka.util.FairPlayUtils.initDataTransform(
                initData,
                contentId,
                cert,
              );
            },
          );
          const networkingEngine = window.shakaPlayer.getNetworkingEngine();
          networkingEngine.clearAllRequestFilters();
          networkingEngine.clearAllResponseFilters();
          networkingEngine.registerRequestFilter((type: any, request: any) => {
            if (
              type !== window.shaka.net.NetworkingEngine.RequestType.LICENSE
            ) {
              return;
            }
            try {
              const dt = {
                userId,
                sessionId: dataStream?.session,
                merchantId: DRM_MERCHANT_NAMES.FPTPLAY,
                appId: process.env.NEXT_PUBLIC_SIGMA_APP_ID,
              };
              // const dt = {
              //   userId: "shaka-nextjs-userid",
              //   sessionId: "shaka-nextjs-userid",
              //   merchantId: "sigma_packager_lite",
              //   appId: "demo",
              // };
              request.uris = [licenseURL];
              request.method = 'POST';
              request.headers['Content-Type'] = 'application/json';
              request.headers['custom-data'] = btoa(JSON.stringify(dt));
              const originalPayload = new Uint8Array(request.body);
              const base64Payload =
                window.shaka.util.Uint8ArrayUtils.toStandardBase64(
                  originalPayload,
                );
              request.body = JSON.stringify({
                spc: base64Payload,
                assetId: contentId,
              });
            } catch (error) {
              console.log({ error });
            }
          });

          window.shakaPlayer
            .getNetworkingEngine()
            .registerResponseFilter(function (type: any, response: any) {
              if (
                type == window.shaka.net.NetworkingEngine.RequestType.LICENSE
              ) {
                // This is the wrapped license, which is a JSON string.
                try {
                  const wrappedString = window.shaka.util.StringUtils.fromUTF8(
                    response.data,
                  );
                  // Parse the JSON string into an object.
                  const wrapped = JSON.parse(wrappedString);
                  // This is a base64-encoded version of the raw license.
                  const rawLicenseBase64 = wrapped.license;
                  // Decode that base64 string into a Uint8Array and replace the response
                  response.data =
                    window.shaka.util.Uint8ArrayUtils.fromBase64(
                      rawLicenseBase64,
                    );
                } catch {}
              }
            });

          if (cb) cb();
          if (errorFairPlay) {
            if (setErrorFairPlay) setErrorFairPlay(false);
          }
        })
        .catch((err) => {
          console.log('ERRORS_SIGMA: ', err.message);
          if (setErrorFairPlay) setErrorFairPlay(true);
        });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      dataChannel,
      dataStream,
      info,
      isHboGo,
      isQNet,
      errorFairPlay,
      setErrorFairPlay,
    ],
  );

  const [tokenPingQNet, setTokenPingQNet] = useState('');
  const intervalPingQNet = useRef(null);
  const endPingHbo = () => {
    if (intervalPingQNet.current) {
      clearInterval(intervalPingQNet.current);
      intervalPingQNet.current = null;
    }
    if (tokenPingQNet) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_Q_NET}/csl/end?token=${tokenPingQNet}`,
        )
        .then(() => {
          setTokenPingQNet('');
        })
        .catch(() => {
          setTokenPingQNet('');
        });
      setTokenPingQNet('');
    }
  };
  const pingEnc = useCallback(async () => {
    await getIp();
    clearInterval(intervalPingEnc.current);
    const deviceID = browserInfo();
    const msgErrorPing: PlayerModalType = {
      submitKey: 'on_understood',
      content: {
        title: 'Thông báo',
        content:
          '[Website] Tài khoản của quý khách hiện đang bị khóa do vi phạm tiêu chuẩn và chính sách của FPT Play. Mọi thắc mắc vui lòng gửi về email hotrofptplay@fpt.com',
        buttons: {
          accept: 'Đã hiểu',
        },
      },
    };
    const isNonDrm =
      dataChannel?.verimatrix === false || dataChannel?.verimatrix === '0';
    let srcStream = '';

    let currentData: any = null;
    let playerEndTime = 0;
    let lastPingSession = '';
    let currentPingSession = dataStream?.ping_session;

    let params: any = {
      session: currentPingSession,
      ping_enc: dataStream?.ping_enc,
    };

    const query: any = {};
    let retryPing = 0;
    const ping = async () => {
      clearInterval(intervalPingEnc.current);
      intervalPingEnc.current = undefined;
      if (lastPingSession) {
        params = {
          last_session: lastPingSession,
          session: currentPingSession,
          ping_enc: dataStream?.ping_enc,
        };
      }
      if (isNonDrm) {
        // truyền hình
        if (router.pathname.includes('/xem-truyen-hinh/')) {
          query.type = 'livetv';
          query.event_id = dataChannel?._id || dataChannel?.id;
        }
        // sự kiện
        if (router.pathname.includes('/su-kien/')) {
          const eventType = router.query.event;
          query.type = eventType;
          query.event_id = eventId;
        }
      }
      // lưu vào storage để end ping
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(
          PING_DRM_DATA,
          JSON.stringify({
            type: query.type,
            event_id: query.event_id,
            channel_id: dataChannel?._id || dataChannel?.id,
            is_non_drm: isNonDrm,
          }),
        );
      }

      const paramsData: any = {
        headers: {
          'X-Did': deviceID,
        },
        params,
        query,
      };
      if (isNonDrm) {
        paramsData.isPingNonDrm = true;
      }
      const promise = pingChannel({
        dataChannel: dataChannel as any,
        session: currentPingSession,
        isNonDrm,
        type: query?.type,
        event_id: query?.event_id,
      });
      promise

        .then((res: any) => {
          if (!res || !isArray(res?.data) || res.code !== 200) {
            trackingShowContentLog29({
              Event: 'ShowFailed',
              ItemName: msgErrorPing?.content as string,
              ItemId: 'fingerprint',
              Key: 'API',
            });
          }
          if (res) {
            if (retryPing > 0) retryPing = 0;
            if (isArray(res?.data)) {
              res = JSON.parse(new Secure().decrypt(res?.data, deviceID));
              switch (res.code) {
                case 200:
                  if (res.data) {
                    if (_.isEqual(currentData, res.data)) {
                      if (res.data.internal) playerEndTime += res.data.internal;
                      if (playerEndTime >= 300) {
                        if (openPlayerNoticeModal)
                          openPlayerNoticeModal(msgErrorPing);
                      }
                    } else {
                      currentData = res.data;
                      if (playerEndTime > 0) playerEndTime = 0;
                    }
                    if (urlToPlay !== srcStream) {
                      if (playVideo) playVideo();
                      srcStream = urlToPlay || '';
                    }

                    lastPingSession = currentPingSession as any;
                    currentPingSession = res.data.session;
                    if (!intervalPingEnc.current) {
                      intervalPingEnc.current = setInterval(() => {
                        ping();
                      }, res.data.interval * 1000) as any;
                      // intervalPingEnc.current = setInterval(() => {
                      //   ping();
                      //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      // }, 2000) as any;
                    }
                    if (
                      res.data.actions &&
                      res.data.actions.length &&
                      res.data.actions[0].type &&
                      res.data.actions[0].type.toUpperCase() === 'SHOW_IP'
                    ) {
                      if (setFingerPrintData)
                        setFingerPrintData(
                          res.data.actions[0] as FingerPrintDataType,
                        );
                      trackingShowContentLog29({
                        Event: 'ShowSuccessfully',
                        ItemName: res.data.actions[0] as string,
                        ItemId: 'fingerprint',
                        Key: 'API',
                      });
                      setTimeout(() => {
                        if (setFingerPrintData) {
                          setFingerPrintData();
                        }
                      }, res.data.actions[0].duration * 1000);
                    }
                  }

                  break;
                case 400:
                case 406:
                case 451:
                  if (destroyPlayer) destroyPlayer();
                  const contentResult = getMsgErrsApi({
                    code: res?.code as number,
                    msg: res?.msg,
                  });
                  if (openPlayerNoticeModal)
                    openPlayerNoticeModal(contentResult);
                  break;
                case 403:
                  if (!intervalPingEnc.current) {
                    intervalPingEnc.current = setInterval(() => {
                      ping();
                    }, 60 * 1000) as any;
                  }
                  break;
              }
            } else if (isObject(res?.data)) {
              if (destroyPlayer) destroyPlayer();
              const contentResult = getMsgErrsApi({
                code: res?.data?.code as number,
                msg: res?.data?.msg,
              });
              if (openPlayerNoticeModal) openPlayerNoticeModal(contentResult);
            }
          } else {
            if (destroyPlayer) destroyPlayer();
            if (openPlayerNoticeModal) openPlayerNoticeModal(msgErrorPing);
          }
        })
        .catch(async (error) => {
          trackingShowContentLog29({
            Event: 'ShowFailed',
            ItemName: error.message as string,
            ItemId: 'fingerprint',
            Key: 'API Failed',
          });
          if (retryPing >= 4) {
            await getIp();
            if (setShowFingerPrintClient) setShowFingerPrintClient(true);
            setTimeout(() => {
              if (setShowFingerPrintClient) setShowFingerPrintClient(false);
              if (destroyPlayer) destroyPlayer();
              if (openPlayerNoticeModal) openPlayerNoticeModal(msgErrorPing);
            }, 60000);
          } else {
            setTimeout(() => {
              retryPing += 1;
              ping();
            }, 60000);
          }
          const { response } = error;
          console.log('response :>> ', response);
          // if (response?.data?.trailer_url) {
          //   const dataTrailer = {
          //     src: replaceMpd(
          //       response.data.trailer_url,
          //       dataChannel.verimatrix,
          //     ),
          //   };
          //   if (dataTrailer.src !== srcStream) {
          //     this.playVideo(dataTrailer);
          //     srcStream = dataTrailer.src;
          //   }
          // } else {
          //   if (intervalPingEnc.current) {
          //     clearInterval(intervalPingEnc.current);
          //     intervalPingEnc.current = null;
          //   }
          //   if (retryPing >= 4) {
          //     this.getIp();
          //     this.showFingerPrintClient = true;
          //     setTimeout(() => {
          //       this.showFingerPrintClient = false;
          //       this.destroyPlayer();
          //       this.dataMsg = msgErrorPing;
          //     }, 60000);
          //   } else {
          //     setTimeout(() => {
          //       retryPing += 1;
          //       ping();
          //     }, 60000);
          //   }
          // }
        });
    };
    ping();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream, router, eventId]);
  const endPingEnc = async () => {
    if (setFingerPrintData) setFingerPrintData(undefined);
    if (intervalPingEnc.current) {
      clearInterval(intervalPingEnc.current);
      intervalPingEnc.current = undefined;
    }
    try {
      deletePingChannel({ dataChannel });
    } catch {}
  };
  const pingNormal = useCallback(() => {
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream]);
  const pingHbo = useCallback(() => {
    //
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream]);
  const initPing = useCallback(() => {
    if (dataStream?.ping_enable && info?.user_id_str) {
      if (dataStream?.ping_enc) {
        pingEnc();
      } else {
        pingNormal();
      }
    } else if (dataStream?.ping_qnet && info?.user_id_str) {
      pingHbo();
    } else {
      if (playVideo) playVideo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataChannel, dataStream, info]);

  async function checkDrmSupport() {
    if (typeof window.shaka === 'undefined') {
      return {};
    }
    try {
      const support = await window.shaka.Player.probeSupport();
      const drmSupport = support.drm || {};
      return {
        isSupportWidevine: !!drmSupport['com.widevine.alpha'],
        isSupportPlayReady: !!drmSupport['com.microsoft.playready'],
      };
    } catch {
      return {};
    }
  }

  return {
    tokenPingQNet,
    initNetworkingEngine,
    initFairPlay,
    initFairPlaySigma,
    setTokenPingQNet,
    endPingHbo,
    pingEnc,
    initPing,
    endPingEnc,
    checkDrmSupport,
  };
};
