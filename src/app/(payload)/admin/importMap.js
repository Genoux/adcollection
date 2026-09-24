import { FrameioPickerField as FrameioPickerField_96afb781cd0c6ee528e9f13c6ce1e3ff } from '@/payload/admin/frameio-picker/field'
import { CollectionBuilderField as CollectionBuilderField_982d3ac8612ef6532a6b3c76f2001c8f } from '@/payload/admin/collection-builder/field'
import { CollectionShareField as CollectionShareField_4f2afaf39247bacd4db63ec0f5af81c3 } from '@/payload/admin/collection-share/field'
import { IntegrationsNavLink as IntegrationsNavLink_af7ef2b1b73ff8d3636c1e56cab85f4f } from '@/payload/admin/integrations/nav-link'
import { S3ClientUploadHandler as S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24 } from '@payloadcms/storage-s3/client'
import { IntegrationsView as IntegrationsView_3fdb02f4a196f7a8de1305a32dd1e0b1 } from '@/payload/admin/integrations/view'
import { McpAuthorizeView as McpAuthorizeView_3363b50e1a733e94db137e365204db3c } from '@/payload/admin/mcp-authorize/view'
import { CollectionCards as CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1 } from '@payloadcms/next/rsc'

/** @type import('payload').ImportMap */
export const importMap = {
  "@/payload/admin/frameio-picker/field#FrameioPickerField": FrameioPickerField_96afb781cd0c6ee528e9f13c6ce1e3ff,
  "@/payload/admin/collection-builder/field#CollectionBuilderField": CollectionBuilderField_982d3ac8612ef6532a6b3c76f2001c8f,
  "@/payload/admin/collection-share/field#CollectionShareField": CollectionShareField_4f2afaf39247bacd4db63ec0f5af81c3,
  "@/payload/admin/integrations/nav-link#IntegrationsNavLink": IntegrationsNavLink_af7ef2b1b73ff8d3636c1e56cab85f4f,
  "@payloadcms/storage-s3/client#S3ClientUploadHandler": S3ClientUploadHandler_f97aa6c64367fa259c5bc0567239ef24,
  "@/payload/admin/integrations/view#IntegrationsView": IntegrationsView_3fdb02f4a196f7a8de1305a32dd1e0b1,
  "@/payload/admin/mcp-authorize/view#McpAuthorizeView": McpAuthorizeView_3363b50e1a733e94db137e365204db3c,
  "@payloadcms/next/rsc#CollectionCards": CollectionCards_f9c02e79a4aed9a3924487c0cd4cafb1
}
