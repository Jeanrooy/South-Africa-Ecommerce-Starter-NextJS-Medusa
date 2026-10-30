"use client"
import React from "react"
import { Render } from "@puckeditor/core"
import {
  createBuilderConfig,
  type BuilderData,
  type BuilderContext,
} from "@ecom/page-builder"
export default function VisualLayout({
  data,
  context,
}: {
  data: BuilderData
  context: BuilderContext
}) {
  return <Render config={createBuilderConfig(React, context)} data={data} />
}
