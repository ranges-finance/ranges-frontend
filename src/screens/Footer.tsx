import React from "react";
import styled from "@emotion/styled";

// import telegram from "@assets/icons/telegram.svg";
import github from "@assets/icons/github.svg";
import x from "@assets/icons/x.svg";

export const Footer: React.FC = () => {
  const icons = [
    // {
    //     logo: telegram,
    //     href: "https://t.me/@ranges_finance"
    // },
    {
      logo: x,
      href: "https://x.com/ranges_finance",
    },
    {
      logo: github,
      href: "https://github.com/ranges-finance",
    },
  ];
  return (
    <Root>
      {icons.map(({ logo, href }) => (
        <Icon key={href} src={logo} onClick={() => window.open(href, "_blank")} />
      ))}
    </Root>
  );
};

const Root = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px;
`;
const Icon = styled.img`
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin: 0 10px;
`;
