import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getUploadUrl, uploadFile } from '../api/equipmentList-api'
import Swal from 'sweetalert2' // For alert messages

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface AttachEquipmentProps {
  match: {
    params: {
      equipmentId: string
    }
  }
  auth: Auth
}

interface AttachEquipmentState {
  file: any
  uploadState: UploadState
}

export class AttachEquipment extends React.PureComponent<
  AttachEquipmentProps,
  AttachEquipmentState
> {
  state: AttachEquipmentState = {
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        // alert
        Swal.fire({
          position: 'center',
          icon: 'warning',
          title: 'File should be selected',
          showConfirmButton: true
        })

        return
      }

      this.setUploadState(UploadState.FetchingPresignedUrl)
      const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.equipmentId)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(uploadUrl, this.state.file)

      // alert
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'File was uploaded!',
        showConfirmButton: true
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Could not upload a file',
        showConfirmButton: true
      })
      console.log('Could not upload a file: ' + JSON.stringify(e))
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Upload new image</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}
