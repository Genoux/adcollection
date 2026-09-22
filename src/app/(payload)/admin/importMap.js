import { FrameioPicker as FrameioPicker_a5bd9528e94f2731a2c4f9ef83af57fb } from '@/payload/admin/frameio-picker/picker'
import { IntegrationsNavLink as IntegrationsNavLink_af7ef2b1b73ff8d3636c1e56cab85f4f } from '@/payload/admin/integrations/nav-link'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'
import { IntegrationsView as IntegrationsView_3fdb02f4a196f7a8de1305a32dd1e0b1 } from '@/payload/admin/integrations/view'
import { McpAuthorizeView as McpAuthorizeView_3363b50e1a733e94db137e365204db3c } from '@/payload/admin/mcp-authorize/view'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

/** @type import('payload').ImportMap */
export const importMap = {
  "@/payload/admin/frameio-picker/picker#FrameioPicker": FrameioPicker_a5bd9528e94f2731a2c4f9ef83af57fb,
  "@/payload/admin/integrations/nav-link#IntegrationsNavLink": IntegrationsNavLink_af7ef2b1b73ff8d3636c1e56cab85f4f,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@/payload/admin/integrations/view#IntegrationsView": IntegrationsView_3fdb02f4a196f7a8de1305a32dd1e0b1,
  "@/payload/admin/mcp-authorize/view#McpAuthorizeView": McpAuthorizeView_3363b50e1a733e94db137e365204db3c,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1
}
