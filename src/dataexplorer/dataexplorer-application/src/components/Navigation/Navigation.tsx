import React from 'react';
import { Layout, Avatar } from 'antd';
import Breadcrumbs from './Breadcrumbs/Breadcrumbs';
import Dashboard from '../Dashboard/Dashboard';
import { Switch, Route, withRouter, Link } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import Patient from '../Patient/Patient';
import QuestionnaireResponse from 'components/QuestionnaireResponse/QuestionnaireResponse';
import 'antd/dist/antd.css';
import './Navigation.style.scss';
const { Header, Content } = Layout;
const Navigation = () => {
    return (
        <>
            <Layout>
                <Header className="site-layout-sub-header-background">
                    <Link to="/">
                        <h1>Datautforskeren</h1>
                    </Link>

                    <div className="avatar-container">
                        <Avatar
                            className="header-avatar"
                            shape="square"
                            size="large"
                            icon={<UserOutlined />}
                        />
                        <h1>Dr. Gregory House</h1>
                    </div>
                </Header>
                <div className="breadcrumb-header">
                    <Breadcrumbs />
                </div>
                <Content>
                    <div className="content">
                        <Switch>
                            <Route exact path="/" component={Dashboard} />
                            <Route exact path="/pasient" component={Patient} />
                            <Route
                                exact
                                path="/pasient/skjema"
                                component={QuestionnaireResponse}
                            />
                        </Switch>
                    </div>
                </Content>
            </Layout>
        </>
    );
};

export default withRouter(Navigation);
