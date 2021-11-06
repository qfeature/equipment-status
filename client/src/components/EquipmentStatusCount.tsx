import dateFormat from 'dateformat'
import { History } from 'history'
import * as React from 'react'
import {
  Divider,
  Grid,
  Header,
  Loader,
  Label
} from 'semantic-ui-react'

import { getEquipmentStatusStats } from '../api/equipmentList-api'
import Auth from '../auth/Auth'
import { StatusCount } from '../types/StatusCount'
import Swal from 'sweetalert2'

interface StatusCountListProps {
  auth: Auth
  history: History
}

interface StatusCountListState {
   stastusCountList: StatusCount[]
   loadingStatusCountList: boolean
}

export class EquipmentStatusCount extends React.PureComponent<StatusCountListProps, StatusCountListState> {
  state: StatusCountListState = {
   stastusCountList: [],
   loadingStatusCountList: true
  }

  async componentDidMount() {
    try {
      const stastusCountList = await getEquipmentStatusStats(this.props.auth.getIdToken())
      this.setState({
         stastusCountList,
         loadingStatusCountList: false
      })
    } catch (e) {
      // alert
      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Could not fetch status count list',
        showConfirmButton: true
      })
    }
  }

render() {
   return (
   <div>
      <Header as="h1">Equipment Status Count</Header>

      {this.renderStatusCountList()}
   </div>
   )
}

renderStatusCountList() {
    if (this.state.loadingStatusCountList) {
      return this.renderLoading()
    }

    return this.renderStatusCountItems()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Equipment Status Count
        </Loader>
      </Grid.Row>
    )
  }

  renderStatusCountItems() {
    return (
      <Grid padded>
        <Grid.Column width={5}>
          <h3>Status Name</h3>
        </Grid.Column>
        <Grid.Column width={5}>
          <h3>Status Count</h3>
        </Grid.Column>
        <Grid.Column width={6}>
          <h3>Count Last Updated</h3>
        </Grid.Column>

        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>

        {this.state.stastusCountList.map((statusCount, pos) => {
          return (
            <Grid.Row key={statusCount.statusName}>

               <Grid.Column width={5} verticalAlign="middle">
                {this.formatStatusLabel(statusCount.statusName)}
              </Grid.Column>

              <Grid.Column width={5} verticalAlign="middle">
                <Label circular color="blue">{statusCount.statusCount}</Label>
              </Grid.Column>

              <Grid.Column width={6} verticalAlign="middle">
                {dateFormat(statusCount.updatedAt, 'yyyy-mm-dd HH:MM:ss')}
              </Grid.Column>

            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  formatStatusLabel(status: string) {
    if ('Up' === status)
      return (<Label color="green">{status}</Label>)
    else if ('Down' === status)
      return (<Label color="red">{status}</Label>)
    else if ('Limited' === status)
      return (<Label color="orange">{status}</Label>)
    else
      return (<Label>{status}</Label>)
  }
}
