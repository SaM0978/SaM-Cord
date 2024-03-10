"use client";
import React, { useState, useEffect } from "react";
import fetchApi from "../../_api_/fetch";
import { v4 as uuidv4 } from "uuid";
import { useGlobal } from "@/app/Context/store";

const MODAL_STYLES = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "#1c1f24",
  padding: "20px",
  zIndex: 1000,
  borderRadius: "10px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
  maxWidth: "400px",
  width: "80%",
};

const OVERLAY_STYLES = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, .5)",
  zIndex: 1000,
};

const INPUT_STYLES = {
  width: "100%",
  padding: "12px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  boxSizing: "border-box",
  color: "white",
  backgroundColor: "#1c1f24",
};

const BUTTON_STYLES = {
  padding: "10px 20px",
  borderRadius: "5px",
  border: "none",
  backgroundColor: "red",
  color: "white",
  marginRight: "10px",
};

function customSytles(customStyle = [1, 2], styleObject) {
  let innerSytles = { ...styleObject };
  innerSytles[customStyle[0]] = customStyle[1];
  return innerSytles;
}

export default function Modal({
  isOpen,
  model,
  onClose,
  modalName,
  fields,
  onFormSubmit,
  IALLOWIT = false,
  deletingValue,
}) {
  const initialFormValues = Object.fromEntries(
    fields.map((field) => [field.name, field.value || ""])
  );
  const [formValues, setFormValues] = useState(initialFormValues);
  const [existingValues, setExistingValues] = useState([]);
  const [isDisabled, setIsDisabled] = useState(false);
  const { user } = useGlobal();

  useEffect(() => {
    if (model) getExistingValues();
  }, []);

  useEffect(() => {}, [existingValues]); // Add dependency to trigger the effect when state changes

  async function getExistingValues() {
    const response = await fetchApi("model/unique", "POST", { model: model });
    setExistingValues(response.uniqueFields);
  }

  const handleChange = (e, fieldName) => {
    const { value } = e.target;
    setFormValues((prevValues) => ({
      ...prevValues,
      [fieldName]: value,
    }));

    // Check if the entered value already exists in the existingValues array
    const isValueUnique = !existingValues.some(
      (item) => item[fieldName] === value
    );
    console.log(isValueUnique);
    setIsDisabled(!isValueUnique);
  };

  const handleClose = () => {
    setFormValues(initialFormValues);
    onClose();
  };

  const handleSubmit = async (e) => {
    if (!isDisabled) {
      e.preventDefault();
      await onFormSubmit(formValues);
      onClose();
    }
  };

  const handleDelete = async () => {
    if (deletingValue && model != "user") {
      await fetchApi(`${model}/delete`, "POST", { id: deletingValue }, true);
      console.log("INNER");
    }
    console.log("OUTER");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div style={OVERLAY_STYLES} onClick={onClose} />
      <div style={MODAL_STYLES}>
        <h2
          style={{ textAlign: "center", marginBottom: "20px", color: "white" }}
        >
          {modalName}
        </h2>
        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <React.Fragment key={field.name}>
              {field.type === "select" ? (
                <select
                  name={field.name}
                  style={INPUT_STYLES}
                  value={formValues[field.name]}
                  onChange={(e) => handleChange(e, field.name)}
                  required
                >
                  <option value="">
                    {field.placeholder || `Select ${field.name}`}
                  </option>
                  {field.options.map((optionElement) => (
                    <option
                      key={optionElement}
                      value={optionElement}
                      defaultChecked={
                        field.value == optionElement ? true : false
                      }
                    >
                      {optionElement}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || "text"}
                  name={field.name}
                  placeholder={field.placeholder || `Enter ${field.name}`}
                  style={INPUT_STYLES}
                  value={formValues[field.name]}
                  onChange={(e) => handleChange(e, field.name)}
                  required
                />
              )}
            </React.Fragment>
          ))}

          <div style={{ textAlign: "center" }}>
            <button
              type="submit"
              style={customSytles(["backgroundColor", "gray"], BUTTON_STYLES)}
              disabled={
                user.username.startsWith("Guest") && !IALLOWIT
                  ? true
                  : isDisabled
              }
            >
              Submit
            </button>
            <button
              onClick={handleClose}
              style={customSytles(["backgroundColor"], BUTTON_STYLES)}
            >
              Close
            </button>
            <button
              onClick={handleDelete}
              style={customSytles(["backgroundColor", "red"], BUTTON_STYLES)}
            >
              Delete
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
