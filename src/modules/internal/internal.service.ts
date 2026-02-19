import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { SoftwareTeamDocument } from '../../schemas/softwareTeam.schema';

@Injectable()
export class InternalService {
  private readonly INTERNAL_TEAM_USERNAME = 'jasim@gmail.com';
  private readonly INTERNAL_TEAM_PASSWORD = 'Jasim@123';

  constructor(
    @Inject('SOFTWARE_TEAM_MODEL')
    private internalTeamModel: Model<SoftwareTeamDocument>,
  ) {}

  async login() {
    let admin = await this.internalTeamModel.findOne({
      username: this.INTERNAL_TEAM_USERNAME,
    });

    // If admin does not exist → create it
    if (!admin) {
      admin = await this.internalTeamModel.create({
        username: this.INTERNAL_TEAM_USERNAME, // ✅ consistent
        password: this.INTERNAL_TEAM_PASSWORD,
      });

      return {
        message: 'Admin created and logged in successfully',
        adminId: admin._id,
      };
    }

    // Validate password
    if (admin.password !== this.INTERNAL_TEAM_PASSWORD) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Admin login successful',
      adminId: admin._id,
      Date: new Date().toISOString(),
    };
  }
}
