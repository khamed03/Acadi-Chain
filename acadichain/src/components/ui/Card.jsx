import React from "react";
import c from "../../styles/card.module.css";
export function Card({ children }){ return <div className={c.card}>{children}</div>; }
export function CardHeader({ children }){ return <div className={c.cardHeader}>{children}</div>; }
export function CardBody({ children }){ return <div className={c.cardBody}>{children}</div>; }
export function CardFooter({ children }){ return <div className={c.cardFooter}>{children}</div>; }
