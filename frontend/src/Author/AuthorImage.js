import PropTypes from 'prop-types';
import React, { Component, useEffect, useRef, useState } from 'react';

function LazyImage({ children, placeholder, rootMargin }) {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || isVisible) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div ref={containerRef}>
      {isVisible ? children : placeholder}
    </div>
  );
}

LazyImage.propTypes = {
  children: PropTypes.node.isRequired,
  placeholder: PropTypes.node.isRequired,
  rootMargin: PropTypes.string.isRequired
};

function findImage(images, coverType) {
  return images.find((image) => image.coverType === coverType);
}

function getUrl(image, coverType, size) {
  const imageUrl = image?.url;

  if (imageUrl) {
    return imageUrl.replace(`${coverType}.jpg`, `${coverType}-${size}.jpg`);
  }
}

class AuthorImage extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    const pixelRatio = Math.ceil(window.devicePixelRatio);

    const {
      images,
      coverType,
      size
    } = props;

    const image = findImage(images, coverType);

    this.state = {
      pixelRatio,
      image,
      url: getUrl(image, coverType, pixelRatio * size),
      isLoaded: false,
      hasError: false
    };
  }

  componentDidMount() {
    if (!this.state.url && this.props.onError) {
      this.props.onError();
    }
  }

  componentDidUpdate() {
    const {
      images,
      coverType,
      placeholder,
      size,
      onError
    } = this.props;

    const {
      image,
      pixelRatio
    } = this.state;

    const nextImage = findImage(images, coverType);

    if (nextImage && (!image || nextImage.url !== image.url)) {
      this.setState({
        image: nextImage,
        url: getUrl(nextImage, coverType, pixelRatio * size),
        hasError: false
        // Don't reset isLoaded, as we want to immediately try to
        // show the new image, whether an image was shown previously
        // or the placeholder was shown.
      });
    } else if (!nextImage && image) {
      this.setState({
        image: nextImage,
        url: placeholder,
        hasError: false
      });

      if (onError) {
        onError();
      }
    }
  }

  //
  // Listeners

  onError = () => {
    this.setState({
      hasError: true
    });

    if (this.props.onError) {
      this.props.onError();
    }
  };

  onLoad = () => {
    this.setState({
      isLoaded: true,
      hasError: false
    });

    if (this.props.onLoad) {
      this.props.onLoad();
    }
  };

  //
  // Render

  render() {
    const {
      className,
      style,
      placeholder,
      size,
      lazy,
      overflow,
      blurBackground
    } = this.props;

    const blurStyle = {
      ...style,
      objectFit: 'fill',
      filter: 'blur(8px)',
      WebkitFilter: 'blur(8px)'
    };

    const {
      url,
      hasError,
      isLoaded
    } = this.state;

    if (hasError || !url) {
      return (
        <img
          className={className}
          style={style}
          src={placeholder}
        />
      );
    }

    if (lazy) {
      const placeholderImage = (
        <img
          className={className}
          style={style}
          src={placeholder}
        />
      );

      return (
        <LazyImage
          placeholder={placeholderImage}
          rootMargin="100px 0px"
        >
          <img
            className={className}
            style={style}
            src={url}
            onError={this.onError}
            onLoad={this.onLoad}
            loading="lazy"
            decoding="async"
            rel="noreferrer"
          />
        </LazyImage>
      );
    }

    return (
      <>
        {
          blurBackground ?
            <img
              style={blurStyle}
              src={isLoaded ? url : placeholder}
              onError={this.onError}
              onLoad={this.onLoad}
            /> :
            null
        }

        <img
          className={className}
          style={style}
          src={isLoaded ? url : placeholder}
          onError={this.onError}
          onLoad={this.onLoad}
        />
      </>
    );
  }
}

AuthorImage.propTypes = {
  className: PropTypes.string,
  style: PropTypes.object,
  images: PropTypes.arrayOf(PropTypes.object).isRequired,
  coverType: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  lazy: PropTypes.bool.isRequired,
  overflow: PropTypes.bool.isRequired,
  blurBackground: PropTypes.bool.isRequired,
  onError: PropTypes.func,
  onLoad: PropTypes.func
};

AuthorImage.defaultProps = {
  size: 250,
  lazy: true,
  overflow: false,
  blurBackground: false
};

export default AuthorImage;
