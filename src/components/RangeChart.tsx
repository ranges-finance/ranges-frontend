/* eslint-disable */
import { PolarGrid, Radar, RadarChart } from "recharts";

import Tooltip from "@components/Tooltip";

import RadarWithImage from "@src/components/RadarWithImage";

interface IParams {
  assetsWithLeverage: {
    assetId: string;
    reversedLeverage: number;
    relativeReversedLeverage: number;
  }[];
  size: number;
  uniqueId?: string | number;
  chartStyle?: React.CSSProperties;
  filterDeviation?: number;
  showTooltip?: boolean;
}

// const AssetsList = styled.div`
//   display: grid;
//   gap: 8px;
//   grid-template-columns: repeat(2, 1fr);
// `;

// const TokenIcon = styled(Img)`
//   width: 20px;
//   height: 20px;
//   border-radius: 50%;
// `;

const RangeChart: React.FC<IParams> = ({
  assetsWithLeverage,
  size,
  uniqueId,
  chartStyle,
  filterDeviation = 12,
}: IParams) => {
  // const iconSize = size / 7.5;
  // const halfIcon = iconSize / 2;
  const backgroundIconSize = size / 2;
  const halfBackgroundIcon = backgroundIconSize / 2;

  return (
    <RadarChart
      data={assetsWithLeverage}
      height={size}
      style={{
        transform: assetsWithLeverage.length < 3 ? "rotate(-90deg)" : "",
        cursor: "pointer",
        ...chartStyle,
      }}
      width={size}
    >
      <PolarGrid />
      <Radar
        dataKey="relativeReversedLeverage"
        isAnimationActive={false}
        shape={(props) => {
          return (
            <>
              <defs>
                <filter
                  colorInterpolationFilters="sRGB"
                  height="300%"
                  id={"blur" + uniqueId}
                  width="300%"
                  x="-100%"
                  y="-100%"
                >
                  <feGaussianBlur in="SourceGraphic" stdDeviation={filterDeviation} />
                </filter>
              </defs>
              <RadarWithImage
                imageElement={
                  <g filter={`url(#blur${uniqueId})`}>
                    {props.points.map((point: any, i: any) => (
                      <image
                        // href={TOKENS_BY_ASSET_ID[point.name].logo}
                        key={i}
                        height={backgroundIconSize}
                        style={{
                          opacity: 0.9,
                          borderRadius: halfBackgroundIcon, // Note: SVG image does not support borderRadius directly
                        }}
                        width={backgroundIconSize}
                        x={point.x - halfBackgroundIcon}
                        y={point.y - halfBackgroundIcon}
                      />
                    ))}
                  </g>
                }
                uniqueId={uniqueId}
                useSvgImage
                {...props}
              />
            </>
          );
        }}
      />
      {/* <PolarAngleAxis
        dataKey="assetId"
        tick={(props) => (
          <foreignObject
            height={iconSize}
            width={iconSize}
            x={(props.x ?? 0) - halfIcon} // Use default value if undefined
            y={(props.y ?? 0) - halfIcon} // Use default value if undefined
          >
            <Img
              src={TOKENS_BY_ASSET_ID[props.payload.value].logo}
              style={{
                width: iconSize,
                height: iconSize,
                borderRadius: halfIcon,
                transform: assetsWithLeverage.length < 3 ? "rotate(90deg)" : "",
              }}
            />
          </foreignObject>
        )}
      /> */}
    </RadarChart>
  );
};

const RangeChartWrapper: React.FC<IParams> = ({ assetsWithLeverage, showTooltip = true, ...rest }: IParams) => {
  return showTooltip ? (
    <Tooltip
      config={{ placement: "bottom" }}
      content=""
      // content={
      //   <Column crossAxisSize="max">
      //     {/* <Text >
      //       Range represents the ratio of actual liquidity to virtual liquidity. The farther a token’s point is from the
      //       center, the higher its actual liquidity.
      //     </Text> */}
      //     <SizedBox height={10} />
      //     <AssetsList>
      //       {assetsWithLeverage
      //         .map((asset) => ({
      //           ...TOKENS_BY_ASSET_ID[asset.assetId],
      //           ...asset
      //         }))
      //         .map(({ logo, symbol, reversedLeverage }, index) => (
      //           <Row crossAxisSize="max" key={index}>
      //             <TokenIcon src={logo} />
      //             <SizedBox width={6} />
      //             <Text type="H">
      //               {symbol} - {reversedLeverage.toFixed(2)}
      //             </Text>
      //           </Row>
      //         ))}
      //     </AssetsList>
      //   </Column>
      // }
      // style={{ cursor: "pointer" }}
    >
      <RangeChart assetsWithLeverage={assetsWithLeverage} {...rest} />
    </Tooltip>
  ) : (
    <RangeChart assetsWithLeverage={assetsWithLeverage} {...rest} />
  );
};

export default RangeChartWrapper;
