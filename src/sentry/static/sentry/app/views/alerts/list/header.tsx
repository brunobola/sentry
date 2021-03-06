import React from 'react';
import {InjectedRouter} from 'react-router/lib/Router';
import styled from '@emotion/styled';

import {navigateTo} from 'app/actionCreators/navigation';
import Feature from 'app/components/acl/feature';
import Button from 'app/components/button';
import ButtonBar from 'app/components/buttonBar';
import CreateAlertButton from 'app/components/createAlertButton';
import * as Layout from 'app/components/layouts/thirds';
import Link from 'app/components/links/link';
import NavTabs from 'app/components/navTabs';
import {IconSettings} from 'app/icons';
import {t} from 'app/locale';
import space from 'app/styles/space';
import {Organization} from 'app/types';

type Props = {
  router: InjectedRouter;
  organization: Organization;
  activeTab: 'stream' | 'rules';
};

const AlertHeader = ({router, organization, activeTab}: Props) => {
  /**
   * Incidents list is currently at the organization level, but the link needs to
   * go down to a specific project scope.
   */
  const handleNavigateToSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateTo(`/settings/${organization.slug}/projects/:projectId/alerts/`, router);
  };

  return (
    <Layout.Header>
      <StyledLayoutHeaderContent>
        <StyledLayoutTitle>{t('Alerts')}</StyledLayoutTitle>
        <StyledNavTabs underlined>
          <Feature features={['incidents']} organization={organization}>
            <li className={activeTab === 'stream' ? 'active' : ''}>
              <Link to={`/organizations/${organization.slug}/alerts/`}>
                {t('Metric Alerts')}
              </Link>
            </li>
          </Feature>
          <li className={activeTab === 'rules' ? 'active' : ''}>
            <Link to={`/organizations/${organization.slug}/alerts/rules/`}>
              {t('Alert Rules')}
            </Link>
          </li>
        </StyledNavTabs>
      </StyledLayoutHeaderContent>
      <Layout.HeaderActions>
        <Actions gap={1}>
          <Button
            size="small"
            onClick={handleNavigateToSettings}
            href="#"
            icon={<IconSettings size="xs" />}
          >
            {t('Settings')}
          </Button>

          <CreateAlertButton
            organization={organization}
            iconProps={{size: 'xs'}}
            size="small"
            priority="primary"
            referrer="alert_stream"
          >
            {t('Create Alert Rule')}
          </CreateAlertButton>
        </Actions>
      </Layout.HeaderActions>
    </Layout.Header>
  );
};

export default AlertHeader;

const StyledLayoutHeaderContent = styled(Layout.HeaderContent)`
  margin-bottom: 0;
`;

const StyledLayoutTitle = styled(Layout.Title)`
  margin-top: 0;
`;

const StyledNavTabs = styled(NavTabs)`
  margin-top: 15px;
  margin-bottom: 0;
  border-bottom: 0 !important;
  li {
    margin-right: ${space(0.5)};
  }
  li > a {
    padding: ${space(1)} ${space(2)};
  }
`;

const Actions = styled(ButtonBar)`
  height: 32px;
`;
