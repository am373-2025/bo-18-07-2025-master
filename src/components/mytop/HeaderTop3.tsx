import React from "react";

interface HeaderTop3Props {
  count: number;
}

const HeaderTop3: React.FC<HeaderTop3Props> = ({ count }) => (
  <div className="flex items-center justify-between mb-2">
    <h2 className="text-lg font-bold">Mon Top {count}</h2>
    {/* TODO: bouton de réinitialisation, partage, etc. */}
  </div>
);

export default HeaderTop3; 