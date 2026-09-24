"use client";

import { Button, TextInput, toast, useDocumentInfo, useFormFields } from "@payloadcms/ui";
import { useEffect, useState } from "react";
import styles from "@/payload/admin/collection-share/field.module.css";

export function CollectionShareField() {
  const { id } = useDocumentInfo();
  const shareId = useFormFields(([fields]) => fields.shareId?.value as string | undefined);
  // The admin is served from the same origin as the public site, and reading it
  // client-side keeps preview deployments from sharing production links.
  const [origin, setOrigin] = useState<string | null>(null);
  useEffect(() => setOrigin(window.location.origin), []);

  if (!id || !shareId) {
    return (
      <div className={styles.panel}>
        <p className={styles.label}>Share collection</p>
        <p className={styles.hint}>Save the collection to get its share link.</p>
      </div>
    );
  }

  const shareUrl = origin ? `${origin}/collections/${shareId}` : "";

  async function copy() {
    await navigator.clipboard.writeText(shareUrl);
    toast.success("Share link copied");
  }

  return (
    <div className={styles.panel}>
      <p className={styles.label}>Share collection</p>
      <TextInput path="collection-share-url" className={styles.url} readOnly value={shareUrl} />
      <div className={styles.actions}>
        <Button buttonStyle="primary" size="small" margin={false} onClick={copy}>
          Copy link
        </Button>
        <Button buttonStyle="pill" size="small" margin={false} url={shareUrl} newTab el="anchor">
          Open
        </Button>
      </div>
      <p className={styles.hint}>Anyone with the link can view the published ads in it.</p>
    </div>
  );
}
