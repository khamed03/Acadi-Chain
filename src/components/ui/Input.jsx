import React from "react";
import s from "../../styles/form.module.css";
export default function Input(props){ return <input {...props} className={s.input + (props.className? " "+props.className : "")} />; }
