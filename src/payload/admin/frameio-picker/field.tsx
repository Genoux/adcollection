import type { UploadFieldServerProps } from "payload";
import { FrameioPicker } from "@/payload/admin/frameio-picker/picker";
import { connectionStatus } from "@/payload/frameio/connection";
import { isFrameioConfigured } from "@/shared/lib/frameio/config";

type Props = UploadFieldServerProps & { thumbnailPath: string };

export async function FrameioPickerField({ path, payload, readOnly, thumbnailPath, user }: Props) {
  if (user?.collection !== "users" || !isFrameioConfigured()) return null;

  const status = await connectionStatus(payload, Number(user.id));
  if (status.state !== "connected") return null;

  return <FrameioPicker path={path} readOnly={readOnly} thumbnailPath={thumbnailPath} />;
}
