import * as React from 'react'
import { Form, Button, Dropdown, Input, Grid, Segment, Divider} from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { updateEquipment /*getUploadUrl, uploadFile*/ } from '../api/equipmentList-api'
import { History } from 'history'

// enum UploadState {
//   NoUpload,
//   FetchingPresignedUrl,
//   UploadingFile,
// }

interface EditEquipmentProps {
  match: {
    params: {
      equipmentId: string
    }
  }
  auth: Auth,
  history: History
}

interface EditEquipmentState {
  newEquipmentName: string
  newEquipmentStatus: string
}

export class EditEquipment extends React.PureComponent<
  EditEquipmentProps,
  EditEquipmentState
> {
  state: EditEquipmentState = {
    newEquipmentName: '', //TODO: fill in?
    newEquipmentStatus: '' //TODO: fill in?
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newEquipmentName: event.target.value })
  }

  handleStatusChange = (event: any, data: any) => {
    this.setState({ newEquipmentStatus: data.value })
  }

  // handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = event.target.files
  //   if (!files) return

  //   this.setState({
  //     file: files[0]
  //   })
  // }

  // handleSubmit = async (event: React.SyntheticEvent) => {
  //   event.preventDefault()

  //   try {
  //     if (!this.state.file) {
  //       alert('File should be selected')
  //       return
  //     }

  //     this.setUploadState(UploadState.FetchingPresignedUrl)
  //     const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), this.props.match.params.equipmentId)

  //     this.setUploadState(UploadState.UploadingFile)
  //     await uploadFile(uploadUrl, this.state.file)

  //     alert('File was uploaded!')
  //   } catch (e) {
  //     alert('Could not upload a file: ' + JSON.stringify(e))
  //   } finally {
  //     this.setUploadState(UploadState.NoUpload)
  //   }
  // }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      // await updateEquipment(
      //   this.props.auth.getIdToken(),
      //   this.props.match.params.equipmentId,
      //   {name: newEquipmentName, statusChangedAt: changedAtTime, status: newEquipmentStatus})
      //RESUME HERE!!!!
      alert('Equipment changed!')
    } catch (e) {
      alert('Could not make the change: ' + JSON.stringify(e))
    } finally {

    }
  }

  render() {
    const equipmentToEdit: any = this.props.history.location.state
    return (
      <div>
        <h1>Change Equipment Information</h1>

        <Segment placeholder>
          <Grid columns={2} relaxed='very' stackable>
            <Grid.Column>
              <h3>Name: {equipmentToEdit.currentName}</h3>

              <h3>Status: {equipmentToEdit.currentStatus}</h3>
            </Grid.Column>
            <Grid.Column verticalAlign='middle'>
              <Form onSubmit={this.handleSubmit}>
                <Form.Group>
                  <Form.Field>
                    <h3>New Name</h3>
                    <Input
                        placeholder={equipmentToEdit.currentName}
                        onChange={this.handleNameChange}
                        maxLength="50"
                      />
                  </Form.Field>

                  <Form.Field>
                    <h3>New Status</h3>
                    <Dropdown 
                        placeholder="New status"
                        fluid
                        selection
                        onChange={this.handleStatusChange}
                        options={[{key: 'Up', value: 'Up', text: 'Up'},
                          {key: 'Down', value: 'Down', text: 'Down'},
                          {key: 'Limited', value: 'Limited', text: 'Limited'}]} />
                  </Form.Field>

                  <Form.Field>
                    <h3>Action </h3>
                    {this.renderButton()}
                  </Form.Field>
                </Form.Group>
              </Form>
            </Grid.Column>
          </Grid>

          <Divider vertical>TO</Divider>
        </Segment>
      </div>
    )
  }

  renderButton() {
    return (
      <div>
        <Button type="submit" color="blue">
          Save
        </Button>
      </div>
    )
  }
}
