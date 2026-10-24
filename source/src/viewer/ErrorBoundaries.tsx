// @ts-nocheck
import * as React from 'react';
import { useViewerStore } from '../store/viewerStore';

export var OverlayErrorBoundary = class extends React.Component {
  state = {
    failed: false,
  };
  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.failed) {
      return null;
    } else {
      return this.props.children;
    }
  }
};

export var ModelErrorBoundary = class extends React.Component {
  state = {
    failed: false,
  };
  static getDerivedStateFromError() {
    return {
      failed: true,
    };
  }
  componentDidCatch(e) {
    useViewerStore.getState().setAssetStatus({
      loading: false,
      error: e.message || 'The 3D model could not be loaded.',
    });
  }
  componentDidUpdate(e) {
    if (e.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({
        failed: false,
      });
    }
  }
  render() {
    if (this.state.failed) {
      return null;
    } else {
      return this.props.children;
    }
  }
};
