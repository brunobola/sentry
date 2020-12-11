import React from 'react';
import * as Sentry from '@sentry/react';
import PropTypes from 'prop-types';

import {addSuccessMessage} from 'app/actionCreators/indicator';
import AsyncComponent from 'app/components/asyncComponent';
import AbstractExternalIssueForm, {
  ExternalIssueAction,
} from 'app/components/externalIssues/abstractExternalIssueForm';
import NavTabs from 'app/components/navTabs';
import {t} from 'app/locale';
import SentryTypes from 'app/sentryTypes';
import {Group, Integration, IntegrationExternalIssue, IssueConfigField} from 'app/types';
import Form from 'app/views/settings/components/forms/form';

const MESSAGES_BY_ACTION = {
  link: t('Successfully linked issue.'),
  create: t('Successfully created issue.'),
};

const SUBMIT_LABEL_BY_ACTION = {
  link: t('Link Issue'),
  create: t('Create Issue'),
};

type Props = {
  group: Group;
  handleClick: (action: ExternalIssueAction) => void;
  integration: Integration;
  onSubmitSuccess: (
    externalIssue: IntegrationExternalIssue,
    onSuccess: () => void
  ) => void;
} & AbstractExternalIssueForm['props'];

type State = AbstractExternalIssueForm['state'];

class ExternalIssueForm extends AbstractExternalIssueForm<Props, State> {
  loadTransaction?: ReturnType<typeof Sentry.startTransaction>;
  submitTransaction?: ReturnType<typeof Sentry.startTransaction>;

  static propTypes = {
    group: SentryTypes.Group.isRequired,
    integration: PropTypes.object.isRequired,
    action: PropTypes.oneOf(['link', 'create']),
    onSubmitSuccess: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.loadTransaction = this.startTransaction('load');
  }

  getEndpoints(): ReturnType<AsyncComponent['getEndpoints']> {
    const {group, integration} = this.props;
    return [
      [
        'integrationDetails',
        `/groups/${group.id}/integrations/${integration.id}/?action=${this.action}`,
      ],
    ];
  }

  startTransaction = (type: 'load' | 'submit') => {
    const {group, integration} = this.props;
    const transaction = Sentry.startTransaction({name: `externalIssueForm.${type}`});
    transaction.setTag('issueAction', this.action);
    transaction.setTag('groupID', group.id);
    transaction.setTag('projectID', group.project.id);
    transaction.setTag('integrationSlug', integration.provider.slug);
    transaction.setTag('integrationType', 'firstParty');
    return transaction;
  };

  handlePreSubmit = () => {
    this.submitTransaction = this.startTransaction('submit');
  };

  onSubmitSuccess = (data: IntegrationExternalIssue): void => {
    const {onSubmitSuccess} = this.props;

    onSubmitSuccess(data, () => addSuccessMessage(MESSAGES_BY_ACTION[this.action]));
    this.submitTransaction?.finish();
  };

  handleSubmitError = () => {
    this.submitTransaction?.finish();
  };

  onLoadAllEndpointsSuccess() {
    this.loadTransaction?.finish();
  }

  onRequestError = () => {
    this.loadTransaction?.finish();
  };

  getEndPointString = () => {
    const {group, integration} = this.props;
    return `/groups/${group.id}/integrations/${integration.id}/`;
  };

  getFormProps = (): Form['props'] => {
    return {
      ...this.getDefaultFormProps(),
      submitLabel: SUBMIT_LABEL_BY_ACTION[this.action],
      apiEndpoint: this.getEndPointString(),
      apiMethod: this.action === 'create' ? 'POST' : 'PUT',
      onPreSubmit: this.handlePreSubmit,
      onSubmitError: this.handleSubmitError,
      onSubmitSuccess: this.onSubmitSuccess,
    };
  };

  renderNavTabs = () => {
    const {handleClick} = this.props;

    return (
      <NavTabs underlined>
        <li className={this.action === 'create' ? 'active' : ''}>
          <a onClick={() => handleClick('create')}>{t('Create')}</a>
        </li>
        <li className={this.action === 'link' ? 'active' : ''}>
          <a onClick={() => handleClick('link')}>{t('Link')}</a>
        </li>
      </NavTabs>
    );
  };

  renderBody() {
    const {integrationDetails} = this.state;
    if (!integrationDetails) {
      return <React.Fragment />;
    }
    const config: IssueConfigField[] = integrationDetails[this.getConfigName()];
    return this.renderForm(config);
  }
}

export default ExternalIssueForm;
