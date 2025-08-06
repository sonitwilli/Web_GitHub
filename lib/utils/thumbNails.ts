/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios';
export default class {
  private progressBarEle_: any;
  private readonly vttThumbnail_: string;
  private type_: string;

  $videoEle: any = document.querySelector('video');
  $thumbnailHolderEle: any = document.querySelector('.thumbnail-holder');
  $currentTimeHoverEle: any = document.querySelector('.current-time-hover');
  $thumbnailImgEle: any = document.querySelector('.thumbnail-img');
  $cues: Array<any> = [];
  inputEle: HTMLElement | null = document.querySelector(
    '.shaka-range-element.shaka-seek-bar',
  );

  constructor(
    progressBarEle: any,
    vttThumbnail: string,
    type: string = 'videojs',
  ) {
    this.progressBarEle_ = progressBarEle;
    this.vttThumbnail_ = vttThumbnail;
    this.type_ = type;

    if (this.$thumbnailHolderEle) {
      this.$thumbnailHolderEle.parentNode.removeChild(this.$thumbnailHolderEle);
    }
    if (this.inputEle) {
      this.inputEle.onclick = (e: any) => {
        this.inputEvent(e);
      };
    }
    if (this.vttThumbnail_) {
      this.create();
      this.fetchFileVtt();
      this.progressBarEle_.onmousemove = (e: any) => {
        this.moveListener(e);
      };
      this.progressBarEle_.ontouchmove = (e: any) => {
        this.moveListener(e);
      };
      this.progressBarEle_.onmouseout = () => {
        this.moveCancel();
      };
      this.progressBarEle_.ontouchcancel = () => {
        this.moveCancel();
      };
      this.progressBarEle_.ontouchend = () => {
        this.moveCancel();
      };
    }
  }

  inputEvent(event: any) {
    try {
      const videoDuration = this.$videoEle.duration;
      if (this.inputEle) {
        const inputSize = this.inputEle.getBoundingClientRect();
        const inputLeftDistance = inputSize.left;
        const pageX: any = event.changedTouches
          ? event.changedTouches[0]?.pageX
          : event?.pageX;

        const mouseLeftDistance =
          pageX ||
          event.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft;

        const mouseDistanceOnInput = mouseLeftDistance - inputLeftDistance;
        const time = (mouseDistanceOnInput / inputSize.width) * videoDuration;
        this.$videoEle.currentTime = time;
      }
    } catch (error) {}
  }

  create() {
    this.$thumbnailHolderEle = document.createElement('div');
    this.$thumbnailHolderEle.className = 'thumbnail-holder';
    this.$thumbnailImgEle = document.createElement('img');
    this.$thumbnailImgEle.className = 'thumbnail-img';
    this.$currentTimeHoverEle = document.createElement('div');
    this.$currentTimeHoverEle.className = 'current-time-hover';
    // this.$thumbnailHolderEle.appendChild(this.$currentTimeHoverEle);
    this.$thumbnailHolderEle.appendChild(this.$thumbnailImgEle);
    this.progressBarEle_.appendChild(this.$thumbnailHolderEle);
  }

  fetchFileVtt() {
    const convertHoursToSeconds = (time: any) => {
      return parseInt(
        String(time[0] * 3600 + time[1] * 60 + Math.floor(time[2])),
      );
    };
    axios
      .get(this.vttThumbnail_)
      .then((data: any) => {
        try {
          const items = data.data.split('\n\r');
          const newItems: any = items[0].split('\n\n');
          delete newItems[0];
          newItems.forEach((item: any) => {
            const infoTrack = item.split('\n');
            const cue = {
              url: infoTrack[2],
              startTime: convertHoursToSeconds(
                infoTrack[1].split('-->')[0].trim().split(':'),
              ),
              endTime: convertHoursToSeconds(
                infoTrack[1].split('-->')[1].trim().split(':'),
              ),
              label: infoTrack[0],
            };
            this.$cues.push(cue);
          });
        } catch (err) {}
      })
      .catch((e: any) => {
        this.$cues = [];
      });
  }

  scrollOffset() {
    if (window.pageXOffset) {
      return {
        x: window.pageXOffset,
        y: window.pageYOffset,
      };
    }
    return {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    };
  }

  parseImageLink(imgLocation: any, url: string) {
    const hashIndex: any = imgLocation.indexOf('#');
    if (hashIndex === -1) {
      return { src: imgLocation, w: 0, h: 0, x: 0, y: 0 };
    }
    const src = imgLocation.substring(0, hashIndex);
    const hashString: any = imgLocation.substring(hashIndex + 1);
    if (hashString.substring(0, 5) !== 'xywh=') {
      return {
        src: url.replace(url.substr(url.lastIndexOf('/') + 1), src),
        w: 0,
        h: 0,
        x: 0,
        y: 0,
      };
    }
    const data = hashString.substring(5).split(',');
    return {
      src: url.replace(url.substr(url.lastIndexOf('/') + 1), src),
      w: parseInt(data[2]),
      h: parseInt(data[3]),
      x: parseInt(data[0]),
      y: parseInt(data[1]),
    };
  }

  moveListener(event: any) {
    let setting: any;
    const seekBarControl: any = this.progressBarEle_.getBoundingClientRect();
    const pageXOffset: any = this.scrollOffset()?.x;
    const right: any =
      (seekBarControl.width || seekBarControl.right) + pageXOffset;
    const pageX: any = event.changedTouches
      ? event.changedTouches[0]?.pageX
      : event?.pageX;

    // find the page offset of the mouse
    let left: any =
      pageX ||
      event.clientX +
        document.body.scrollLeft +
        document.documentElement.scrollLeft;
    const styleLeft: any = left;

    // subtract the page offset of the positioned offset parent
    left -= seekBarControl.left + pageXOffset;

    // apply updated styles to the thumbnail if necessary
    // mouseTime is the position of the mouse along the progress control bar
    // `left` applies to the mouse position relative to the player, so we need
    // to remove the progress control's left offset to know the mouse position
    // relative to the progress control
    const videoDuration = this.$videoEle?.duration || 0;
    const mouseTime = Math.floor((left / seekBarControl.width) * videoDuration);

    // current time tooltip move listener seekBar
    this.$currentTimeHoverEle.innerHTML = new Date(mouseTime * 1000)
      .toISOString()
      .substr(11, 8);

    this.$currentTimeHoverEle.style.left = `${
      this.$thumbnailHolderEle.offsetWidth / 2.5
    }px`;

    const cNum = this.$cues.length;
    let i = 0;
    while (i < cNum) {
      const cue = this.$cues[i];
      if (cue.startTime <= mouseTime && cue.endTime >= mouseTime) {
        setting = this.parseImageLink(cue.url, this.vttThumbnail_);
        break;
      }
      i++;
    }

    // None found, so show nothing
    if (typeof setting === 'undefined') return;

    // Changed image?
    setTimeout(() => {
      if (setting.src && this.$thumbnailImgEle.src !== setting.src) {
        this.$thumbnailImgEle.src = setting.src;
      }
    }, 500);

    // Set the container width/height if it changed
    if (
      this.$thumbnailHolderEle.style.width !== setting.w ||
      this.$thumbnailHolderEle.style.height !== setting.h
    ) {
      this.$thumbnailHolderEle.style.width = `${setting.w}px`;
      this.$thumbnailHolderEle.style.height = `${setting.h}px`;
    }
    // Set the image cropping
    this.$thumbnailImgEle.style.left = `${-setting.x}px`;
    this.$thumbnailImgEle.style.top = `${-setting.y}px`;
    this.$thumbnailImgEle.style.clip = `rect(${setting.y}px,${
      setting.w + setting.x
    }px,${setting.y + setting.h}px,${setting.x}px)`;

    const width: any = setting.w;
    const halfWidth: any = setting.w / 2;

    // make sure that the thumbnail doesn't fall off the right side of the left side of the player
    let leftControl = styleLeft - seekBarControl.left + pageXOffset;

    if (leftControl + halfWidth > right) {
      leftControl = right - width;
    } else if (leftControl < halfWidth) {
      leftControl = 0;
    } else {
      leftControl = leftControl - halfWidth;
    }

    this.$thumbnailHolderEle.style.left = `${leftControl}px`;
  }

  moveCancel() {
    if (this.$thumbnailHolderEle)
      this.$thumbnailHolderEle.style.left = '-3000px';
    if (this.$currentTimeHoverEle)
      this.$currentTimeHoverEle.style.left = '-3000px';
  }
}
