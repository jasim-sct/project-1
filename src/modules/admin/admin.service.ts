import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { SoftwareTeamDocument } from 'src/schemas/softwareTeam.schema';

@Injectable()
export class AdminService {
  private readonly ADMIN_USERNAME = 'jasim@gmail.com';
  private readonly ADMIN_PASSWORD = 'Jasim@123';

  constructor(
    @Inject('SOFTWARE_TEAM_MODEL')
    private userModel: Model<SoftwareTeamDocument>,
  ) {}

  async login() {
    let admin = await this.userModel.findOne({
      username: this.ADMIN_USERNAME,
    });

    // If admin does not exist → create it
    if (!admin) {
      admin = await this.userModel.create({
        username: this.ADMIN_USERNAME, // ✅ consistent
        password: this.ADMIN_PASSWORD,
      });

      return {
        message: 'Admin created and logged in successfully',
        adminId: admin._id,
      };
    }

    // Validate password
    if (admin.password !== this.ADMIN_PASSWORD) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      message: 'Admin login successful',
      adminId: admin._id,
    };
  }
}
