export const getDisplacementMap = ({ height, width, radius, depth }) => {
  const rx = radius;
  const ry = radius;
  const Y_percent_start = Math.ceil((radius / height) * 15);
  const Y_percent_end = Math.floor(100 - (radius / height) * 15);
  const X_percent_start = Math.ceil((radius / width) * 15);
  const X_percent_end = Math.floor(100 - (radius / width) * 15);

  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        .mix { mix-blend-mode: screen; }
    </style>
    <defs>
        <linearGradient id="Y" x1="0" x2="0" y1="${Y_percent_start}%" y2="${Y_percent_end}%">
            <stop offset="0%" stop-color="#0F0" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient id="X" x1="${X_percent_start}%" x2="${X_percent_end}%" y1="0" y2="0">
            <stop offset="0%" stop-color="#F00" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
    </defs>
    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#Y)" class="mix" />
      <rect x="0" y="0" height="${height}" width="${width}" fill="url(#X)" class="mix" />
      <rect x="${depth}" y="${depth}" height="${height - 2 * depth}" width="${width - 2 * depth}" fill="#808080" rx="${rx}" ry="${ry}" filter="blur(${depth}px)" />
    </g>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
};

export const getDisplacementFilter = ({
  height,
  width,
  radius,
  depth,
  strength = 35,
  chromaticAberration = 4,
}) => {
  const map = getDisplacementMap({ height, width, radius, depth });
  const scale1 = strength + chromaticAberration * 2;
  const scale2 = strength + chromaticAberration;
  const scale3 = strength;

  const svg = `<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" height="${height}" width="${width}" href="${map}" result="displacementMap" />
            <feDisplacementMap transform-origin="center" in="SourceGraphic" in2="displacementMap" scale="${scale1}" xChannelSelector="R" yChannelSelector="G" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedR" />
            <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${scale2}" xChannelSelector="R" yChannelSelector="G" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="displacedG" />
            <feDisplacementMap in="SourceGraphic" in2="displacementMap" scale="${scale3}" xChannelSelector="R" yChannelSelector="G" />
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="displacedB" />
            <feBlend in="displacedR" in2="displacedG" mode="screen"/>
            <feBlend in2="displacedB" mode="screen"/>
        </filter>
    </defs>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg) + "#displace";
};
