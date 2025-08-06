const removeElementAttrs = ({
  classes,
  attrs,
}: {
  classes: string[];
  attrs: string[];
}) => {
  for (const className of classes) {
    const elements = document.querySelectorAll(`.${className}`);
    for (const attr of attrs) {
      elements.forEach((el) => {
        if (el.hasAttribute(attr)) {
          el.removeAttribute(attr);
        }
      });
    }
  }
};

export { removeElementAttrs };
