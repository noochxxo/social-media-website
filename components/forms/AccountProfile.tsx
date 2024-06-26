"use client"

import * as z from "zod"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { usePathname, useRouter } from "next/navigation"
import { ChangeEvent, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

import { useUploadThing } from "@/lib/uploadthing"
import { isBase64Image } from "@/lib/utils"
import { updateUser } from "@/lib/actions/user.actions"
import { UserValidation } from "@/lib/validations/user"

interface Props {
  user: {
    id: string;
    objectId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
  };
  btnTitle: string;
}

const AccountProfile = ({ user, btnTitle }: Props) => {

  const router = useRouter()
  const pathname = usePathname()
  const { startUpload } = useUploadThing("media")

  const [files, setFiles] = useState<File[]>([])

  const form = useForm<z.infer<typeof UserValidation>>({
    resolver: zodResolver(UserValidation),
    defaultValues: {
      profile_photo: user?.image ? user.image : "",
      name: user?.name ? user.name : "",
      username: user?.username ? user.username : "",
      bio: user?.bio ? user.bio : "",
    }
  })

  const onSubmit = async (values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo

    const hasImageChanged = isBase64Image(blob)
    if (hasImageChanged) {
      const imgRes = await startUpload(files)

      if (imgRes && imgRes[0].url) {
        values.profile_photo = imgRes[0].url
      }
    }

    await updateUser({
      name: values.name,
      path: pathname,
      username: values.username,
      userId: user.id,
      bio: values.bio,
      image: values.profile_photo,
    })

    if (pathname === "/profile/edit") {
      router.back()
    } else {
      router.push("/")
    }
  }

  const handleImage = (
    e: ChangeEvent<HTMLInputElement>,
    fieldChange: (value: string) => void
  ) => {
    e.preventDefault()

    const fileReader = new FileReader()

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setFiles(Array.from(e.target.files))

      if (!file.type.includes("image")) return

      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ""
        fieldChange(imageDataUrl)
      }
      fileReader.readAsDataURL(file)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField 
          control={form.control}
          name='profile_photo'
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {
                  field.value ? (
                    <Image 
                      src={field.value}
                      alt="profile_icon"
                      width={96}
                      height={96}
                      priority
                    />
                  ) : (
                    <Image 
                      src='/assets/profile.svg'
                      alt="profile_icon"
                      width={24}
                      height={24}
                    />
                  )
                }
              </FormLabel>
              <FormControl>
                <Input 
                  type="file"
                  accept="image/*"
                  placeholder="Add profile photo"
                  onChange={(e) => handleImage(e, field.onChange)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name
              </FormLabel>
              <FormControl>
                <Input 
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Username
              </FormLabel>
              <FormControl>
                <Input 
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField 
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Bio
              </FormLabel>
              <FormControl>
                <Textarea 
                  rows={10}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" >
          {btnTitle}
        </Button>
      </form>
    </Form>
  )
}

export default AccountProfile