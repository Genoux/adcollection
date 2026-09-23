import config from "@payload-config";
import { type BasePayload, getPayload, type TypedUser } from "payload";
import type { PickerError } from "@/payload/admin/frameio-picker/types";
import { integrationsPath } from "@/payload/admin/integrations/url";
import { authForUser, FrameioNotConnectedError } from "@/payload/frameio/connection";
import type { FrameioAuth } from "@/shared/lib/frameio/client";
import { FrameioError } from "@/shared/lib/frameio/errors";

type Context = { auth: FrameioAuth; payload: BasePayload; user: TypedUser };

const fail = (body: PickerError, status: number) => Response.json(body, { status });

/**
 * For admin-UI routes authenticated by the Payload session cookie. Frame.io
 * failures come back as JSON the picker can show, not as 500s.
 */
export async function withFrameioSession(
  request: Request,
  run: (context: Context) => Promise<Response>,
) {
  const payload = await getPayload({ config });
  const { user } = await payload.auth({ headers: request.headers });

  if (user?.collection !== "users") return fail({ error: "sign in to Payload first." }, 401);

  try {
    const auth = await authForUser(payload, Number(user.id));
    return await run({ auth, payload, user });
  } catch (error) {
    if (error instanceof FrameioNotConnectedError) {
      return fail({ connectUrl: integrationsPath(payload), error: error.message }, 409);
    }
    if (error instanceof FrameioError) return fail({ error: error.message }, 422);
    throw error;
  }
}
