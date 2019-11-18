import React, { useState, useRef } from 'react';
import { SafeAreaView } from 'react-navigation';
import { View, Switch, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import Text from '../Text';
import Button from '../Button';
import { withTheme } from '../../Config/Theme';
import { userActions } from '../../redux';
import { NavigationService } from '../../utils';

const DrawerContent = ({ logOut, theme: { padding, align, margin } }) => {
  const [coachMode, setCoachMode] = useState(false);

  return (
    <SafeAreaView>
      <View style={[padding.md, align.verical, align.stretch]}>
        <View style={[margin.bottom.md, align.horizontal, align.between, align.center]}>
          <Text>Coach Mode</Text>
          <Switch
            onValueChange={enabled => setCoachMode(enabled)}
            value={coachMode}
          />
        </View>
        <Button
          onPress={() => NavigationService.navigate('Account')}
          buttonStyle={margin.bottom.md}
          text="Account"
          type="row"
        />
        <Button
          onPress={logOut}
          buttonStyle={margin.bottom.md}
          text="Log Out"
          type="row"
        />
      </View>
    </SafeAreaView>
  );
};

export default connect(null, { logOut: userActions.logOut })(withTheme(DrawerContent));
