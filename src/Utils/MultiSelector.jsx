import React, { useState } from "react";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import "../Components/Styles/MultiSelector.css";
const MultiSelector = ({
  options,
  placeholderValue,
  propertyName,
  customizeTemplate,
  getSelectedValue,
}) => {
  const [selectedValue, setSelectedValue] = useState(null);

  return (
    <div className="card flex justify-content-center col-lg-3">
      <MultiSelect
        value={selectedValue}
        options={options}
        onChange={(e) => {
          setSelectedValue(e.value);
          getSelectedValue(e.value);
        }}
        optionLabel={propertyName}
        placeholder={placeholderValue || "Place holder"}
        itemTemplate={customizeTemplate}
        className="w-full md:w-20rem"
        display="chip"
      />
    </div>
  );
};

export default MultiSelector;
