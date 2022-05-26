import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { getConfig } from '@edx/frontend-platform';
import { injectIntl, intlShape } from '@edx/frontend-platform/i18n';
import { AppContext } from '@edx/frontend-platform/react';

import AnonymousUserMenu from './AnonymousUserMenu';
import AuthenticatedUserDropdown from './AuthenticatedUserDropdown';
import messages from './messages';
import BackToDashboard from "../../header/dashboard.png"
import BackToDashboardButton from "../../header/dashboard_back_button.png"
import Responsive from 'react-responsive';

function LinkedLogo({
  href,
  src,
  alt,
  ...attributes
}) {
  return (
    <a href={href} {...attributes}>
      <img className="d-block" src={src} alt={alt} />
    </a>
  );
}

LinkedLogo.propTypes = {
  href: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};

function LearningHeader({
  courseOrg, courseNumber, courseTitle, intl, showUserDropdown, fullName
}) {
  const { authenticatedUser } = useContext(AppContext);

  console.log("Authenticated User")
  console.log(authenticatedUser)
  console.log(useContext(AppContext))

  const headerLogo = (
    <LinkedLogo
      className="logo"
      href={`${getConfig().LMS_BASE_URL}/dashboard`}
      src={getConfig().LOGO_URL}
      alt={getConfig().SITE_NAME}
    />
  );

  return (
    <header className="learning-header">
      <a className="sr-only sr-only-focusable" href="#main-content">{intl.formatMessage(messages.skipNavLink)}</a>
      <div className="container-xl py-2 d-flex align-items-center">
        {headerLogo}
        <div className="flex-grow-1 course-title-lockup" style={{ lineHeight: 1 }}>
          {/* <span className="d-block small m-0">{courseOrg} {courseNumber}</span> */}
          <span className="d-block m-0 font-weight-bold course-title">{courseTitle}</span>
        </div>

        <div className='d-inline-flex flex-row'>
          <>
            <Responsive maxWidth={768}>
              <a href='https://devsfe.proxtera.app/'>
                <img src={BackToDashboardButton} style={{ marginRight: "10px" }} />
              </a>
            </Responsive>
            <Responsive minWidth={769}>
              <a href='https://devsfe.proxtera.app/'>
                <img src={BackToDashboard} style={{ marginRight: "10px" }} />
              </a>
            </Responsive>
          </>
          {showUserDropdown && authenticatedUser && (
            <AuthenticatedUserDropdown
              username={authenticatedUser.username}
              fullName={fullName}
            />
          )}
          {showUserDropdown && !authenticatedUser && (
            <AnonymousUserMenu />
          )}
        </div>
      </div>
    </header>
  );
}

LearningHeader.propTypes = {
  courseOrg: PropTypes.string,
  courseNumber: PropTypes.string,
  courseTitle: PropTypes.string,
  intl: intlShape.isRequired,
  showUserDropdown: PropTypes.bool,
};

LearningHeader.defaultProps = {
  courseOrg: null,
  courseNumber: null,
  courseTitle: null,
  showUserDropdown: true,
};

export default injectIntl(LearningHeader);
